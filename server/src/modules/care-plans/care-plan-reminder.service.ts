import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarePlan } from '../../database/entities/care-plan.entity';
import { CarePlanItem } from '../../database/entities/care-plan-item.entity';
import { CarePlanReminder } from '../../database/entities/care-plan-reminder.entity';
import { Customer } from '../../database/entities/customer.entity';

/**
 * F003-5：月度推送提醒
 *
 * 每月 1 日早上 9:00 自动生成并"推送"护理计划提醒。
 * 当前推送渠道为站内提醒（落库 + 客户端拉取），
 * 后续可接入微信订阅消息 / 短信。
 */
@Injectable()
export class CarePlanReminderService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CarePlanReminderService.name);
  private timer: NodeJS.Timeout | null = null;
  private lastRunPeriod: string | null = null;

  constructor(
    @InjectRepository(CarePlan)
    private carePlanRepo: Repository<CarePlan>,
    @InjectRepository(CarePlanItem)
    private carePlanItemRepo: Repository<CarePlanItem>,
    @InjectRepository(CarePlanReminder)
    private reminderRepo: Repository<CarePlanReminder>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  onModuleInit() {
    this.startScheduler();
  }

  onModuleDestroy() {
    this.stopScheduler();
  }

  /**
   * 启动定时器：每 30 分钟检查一次，若已进入新的月份且当天是 1 号则生成提醒
   */
  private startScheduler() {
    const INTERVAL_MS = 30 * 60 * 1000;
    this.timer = setInterval(() => {
      this.tick().catch((e) => this.logger.error(`月度提醒任务异常: ${e.message}`));
    }, INTERVAL_MS);
    // 启动后延迟 10 秒跑一次，方便服务刚起来时补生成
    setTimeout(() => {
      this.tick().catch((e) => this.logger.error(`月度提醒任务异常: ${e.message}`));
    }, 10_000);
    this.logger.log('月度护理计划提醒定时器已启动（每 30 分钟检查一次）');
  }

  private stopScheduler() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 检查并生成（供定时器与手动接口共用）
   */
  async tick(force = false) {
    const now = new Date();
    const period = this.toPeriod(now);
    const day = now.getDate();

    // 每月 1 号执行；force=true 时忽略日期限制
    if (!force && day !== 1) {
      return { code: 0, data: { skipped: true, reason: `当前是${period}的第${day}天，非推送日` } };
    }
    // 幂等：同一月份只生成一次
    if (!force && this.lastRunPeriod === period) {
      return { code: 0, data: { skipped: true, reason: `${period} 已生成过提醒` } };
    }

    const result = await this.generateMonthlyReminders(period);
    this.lastRunPeriod = period;
    return result;
  }

  /**
   * 生成指定月份（YYYY-MM）的护理计划提醒
   */
  async generateMonthlyReminders(period?: string) {
    const targetPeriod = period || this.toPeriod(new Date());
    const month = Number(targetPeriod.split('-')[1]);

    // 1. 找出所有进行中的护理计划
    const plans = await this.carePlanRepo.find({ where: { status: 'active' } });
    if (plans.length === 0) {
      return { code: 0, data: { period: targetPeriod, created: 0, skipped: true, reason: '暂无进行中的护理计划' } };
    }

    // 2. 找出该月有待办项目的计划
    const planIds = plans.map((p) => p.id);
    const items = await this.carePlanItemRepo
      .createQueryBuilder('i')
      .where('i.planId IN (:...planIds)', { planIds })
      .andWhere('i.plannedMonth = :month', { month })
      .andWhere('i.status = :status', { status: 'pending' })
      .getMany();

    if (items.length === 0) {
      return { code: 0, data: { period: targetPeriod, created: 0, skipped: true, reason: '该月无待办护理项目' } };
    }

    // 3. 按计划分组生成提醒
    const itemsByPlan = new Map<number, CarePlanItem[]>();
    for (const item of items) {
      const list = itemsByPlan.get(item.planId) || [];
      list.push(item);
      itemsByPlan.set(item.planId, list);
    }

    let created = 0;
    for (const [planId, planItems] of itemsByPlan) {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) continue;

      // 幂等：同一客户同一月份同一计划只提醒一次
      const exists = await this.reminderRepo.findOne({
        where: { customerId: plan.customerId, carePlanId: planId, period: targetPeriod },
      });
      if (exists) continue;

      const content = this.buildContent(plan, planItems, targetPeriod);
      await this.reminderRepo.save(
        this.reminderRepo.create({
          customerId: plan.customerId,
          carePlanId: planId,
          period: targetPeriod,
          remindType: 'monthly',
          content,
          status: 'pushed',
          pushedAt: new Date(),
        }),
      );
      created += 1;
    }

    this.logger.log(`已生成 ${created} 条 ${targetPeriod} 月度护理计划提醒`);
    return { code: 0, data: { period: targetPeriod, created } };
  }

  /**
   * 构建提醒文案
   */
  private buildContent(plan: CarePlan, items: CarePlanItem[], period: string): string {
    const [year, month] = period.split('-');
    const skinType = plan.skinType ? `您的肤质为${plan.skinType}` : '根据您的肤质评估';
    const count = items.length;
    const suggested = items
      .map((i) => (i.suggestedDate ? `建议 ${i.suggestedDate}` : '本月内'))
      .join('、');
    return `${year}年${month}月护理提醒：${skinType}，本月为您安排了 ${count} 项护理（${suggested}）。点击查看护理计划详情。`;
  }

  /**
   * 获取客户未读提醒
   */
  async findByCustomer(customerId: number) {
    return this.reminderRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 标记提醒为已读
   */
  async markRead(id: number) {
    const reminder = await this.reminderRepo.findOne({ where: { id } });
    if (!reminder) return { code: 404, message: '提醒不存在' };
    reminder.status = 'read';
    await this.reminderRepo.save(reminder);
    return { code: 0, data: reminder };
  }

  private toPeriod(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
}
