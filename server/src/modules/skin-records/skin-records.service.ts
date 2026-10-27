import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkinRecord } from '../../database/entities/skin-record.entity';
import { SkinComparison } from '../../database/entities/skin-comparison.entity';
import { AiComparisonService } from './ai-comparison.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WechatSubscribeService } from '../notifications/wechat-subscribe.service';

@Injectable()
export class SkinRecordsService {
  private readonly logger = new Logger(SkinRecordsService.name);

  constructor(
    @InjectRepository(SkinRecord)
    private skinRecordRepo: Repository<SkinRecord>,
    @InjectRepository(SkinComparison)
    private skinComparisonRepo: Repository<SkinComparison>,
    private readonly aiComparisonService: AiComparisonService,
    private readonly notificationsService: NotificationsService,
    private readonly wechatSubscribeService: WechatSubscribeService,
  ) {}

  // 创建肤质记录
  async create(data: {
    customerId: number;
    skinType?: string;
    skinIssues?: string;
    photoUrl?: string;
    aiAnalysis?: any;
    technicianId?: number;
    notes?: string;
    recordDate?: string;
  }) {
    const record = this.skinRecordRepo.create({
      ...data,
      recordDate: data.recordDate ? new Date(data.recordDate) : new Date(),
    });
    return this.skinRecordRepo.save(record);
  }

  // 获取客户肤质记录
  async findByCustomer(customerId: number) {
    return this.skinRecordRepo.find({
      where: { customerId },
      order: { recordDate: 'DESC' },
    });
  }

  async findOne(id: number) {
    const record = await this.skinRecordRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('肤质记录不存在');
    return record;
  }

  /**
   * F001-4：生成 AI 对比图
   * 流程：读取前后两条肤质记录 → AI 分析肤质差异 → 生成对比图 → 落库
   */
  async generateComparison(data: {
    customerId: number;
    beforeRecordId?: number;
    afterRecordId?: number;
    improvementHighlights?: string;
    push?: boolean;
  }) {
    const { customerId } = data;
    if (!customerId) throw new BadRequestException('缺少 customerId');

    // 定位前后记录
    let before: SkinRecord | null = null;
    let after: SkinRecord | null = null;

    if (data.beforeRecordId && data.afterRecordId) {
      before = await this.skinRecordRepo.findOne({
        where: { id: data.beforeRecordId, customerId },
      });
      after = await this.skinRecordRepo.findOne({
        where: { id: data.afterRecordId, customerId },
      });
    } else {
      // 未指定则自动取最近两条
      const list = await this.skinRecordRepo.find({
        where: { customerId },
        order: { recordDate: 'DESC' },
        take: 2,
      });
      if (list.length < 2) {
        throw new BadRequestException('该客户至少需要两条肤质记录才能生成对比图');
      }
      after = list[0];
      before = list[1];
    }

    if (!before || !after) {
      throw new NotFoundException('未找到对应的肤质记录');
    }
    if (!before.photoUrl || !after.photoUrl) {
      throw new BadRequestException('前后记录均需包含照片才能生成对比图');
    }

    // 1. AI 分析肤质差异 → 改善亮点文案
    const { improvementHighlights, analysis } =
      await this.aiComparisonService.analyzeDifference(
        before.photoUrl,
        after.photoUrl,
        {
          beforeSkinType: before.skinType,
          beforeIssues: before.skinIssues,
          afterSkinType: after.skinType,
          afterIssues: after.skinIssues,
        },
      );

    // 2. 生成对比图
    const comparisonImageUrl = await this.aiComparisonService.generateComparisonImage(
      before.photoUrl,
      after.photoUrl,
      improvementHighlights,
    );

    // 3. 落库
    const comparison = this.skinComparisonRepo.create({
      customerId,
      beforeRecordId: before.id,
      afterRecordId: after.id,
      comparisonImageUrl: comparisonImageUrl || undefined,
      improvementHighlights:
        data.improvementHighlights || improvementHighlights,
      pushed: data.push ? 1 : 0,
      pushTime: data.push ? new Date() : null,
    });

    const saved = await this.skinComparisonRepo.save(comparison);

    // 同步 AI 分析结果回写到后一次记录
    await this.skinRecordRepo.update(after.id, { aiAnalysis: analysis });

    return {
      ...saved,
      before,
      after,
      analysis,
    };
  }

  /** 兼容别名 */
  async createComparison(data: any) {
    return this.generateComparison(data);
  }

  /**
   * 单张照片 AI 分析（门店端「AI分析」按钮）
   * 返回肤质类型、问题列表与建议
   */
  async analyzeSinglePhoto(photoUrl: string) {
    const result = await this.aiComparisonService.analyzeSinglePhoto(photoUrl);
    return {
      code: 0,
      data: result,
    };
  }

  // 获取客户对比记录（含前后照片，供客户端滑块对比）
  async findComparisonsByCustomer(customerId: number) {
    const comparisons = await this.skinComparisonRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });

    // 批量取出涉及的前后记录
    const recordIds = Array.from(
      new Set(
        comparisons
          .flatMap((c) => [c.beforeRecordId, c.afterRecordId])
          .filter((id): id is number => !!id),
      ),
    );
    const records = recordIds.length
      ? await this.skinRecordRepo.find({ where: recordIds.map((id) => ({ id })) })
      : [];
    const recordMap = new Map(records.map((r) => [r.id, r]));

    return comparisons.map((c) => ({
      ...c,
      before: c.beforeRecordId ? recordMap.get(c.beforeRecordId) || null : null,
      after: c.afterRecordId ? recordMap.get(c.afterRecordId) || null : null,
    }));
  }

  /** 获取单条对比图详情 */
  async findComparisonById(id: number) {
    const comparison = await this.skinComparisonRepo.findOne({ where: { id } });
    if (!comparison) throw new NotFoundException('对比记录不存在');
    return comparison;
  }

  /**
   * 推送对比图给客户端（双通道）
   *
   * 通道一：微信一次性订阅消息（主）—— 需用户已在「护理完成确认页」授权
   * 通道二：站内消息（兜底，必做）—— 无论微信通道成功与否都必须落库
   *
   * 规格：f001-comparison-spec.md §5.1
   */
  async pushComparison(id: number) {
    const comparison = await this.skinComparisonRepo.findOne({ where: { id } });
    if (!comparison) throw new NotFoundException('对比记录不存在');

    // 取客户 openid（订阅消息需要）
    let openid: string | null = null;
    try {
      const rows: any[] = await this.skinRecordRepo.manager.query(
        `SELECT openid FROM customers WHERE id = ?`,
        [comparison.customerId],
      );
      openid = rows?.[0]?.openid || null;
    } catch (e: any) {
      this.logger.warn(`读取客户 openid 失败: ${e.message}`);
    }

    // 通道一：微信订阅消息（失败不阻断）
    let wechat: { sent: boolean; reason: string } = { sent: false, reason: '未执行' };
    try {
      wechat = await this.wechatSubscribeService.sendSkinComparisonReady({
        customerId: comparison.customerId,
        openId: openid || '',
        serviceName: '皮肤护理',
        highlight: comparison.improvementHighlights || '',
        link: 'pages/skin-comparison/index',
      });
    } catch (e: any) {
      wechat = { sent: false, reason: e.message };
    }

    // 通道二：站内消息（必做）
    await this.notificationsService.create({
      customerId: comparison.customerId,
      type: 'skin_comparison',
      title: '您有一份新的肤质对比报告',
      summary: comparison.improvementHighlights || '您的护理效果已生成，快来看看变化~',
      link: '/pages/skin-comparison/index',
      refId: comparison.id,
    });

    comparison.pushed = 1;
    comparison.pushTime = new Date();
    await this.skinComparisonRepo.save(comparison);

    return {
      ...comparison,
      pushChannels: {
        wechatSubscribe: wechat,
        inAppMessage: { sent: true, reason: '已落站内消息' },
      },
    };
  }
}
