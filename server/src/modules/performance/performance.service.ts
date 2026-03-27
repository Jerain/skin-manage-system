import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceRecord } from '../../database/entities/performance-record.entity';
import { BonusRule } from '../../database/entities/bonus-rule.entity';
import { TechnicianBonus } from '../../database/entities/technician-bonus.entity';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(PerformanceRecord)
    private perfRepo: Repository<PerformanceRecord>,
    @InjectRepository(BonusRule)
    private bonusRuleRepo: Repository<BonusRule>,
    @InjectRepository(TechnicianBonus)
    private technicianBonusRepo: Repository<TechnicianBonus>,
  ) {}

  // 创建业绩记录（订单完成时自动调用）
  async createPerformance(data: {
    technicianId: number;
    orderId: number;
    appointmentId?: number;
    serviceId: number;
    serviceName: string;
    serviceAmount: number;
    orderDate?: string;
  }) {
    // 根据服务金额计算提成
    const commissionRate = this.calculateCommissionRate(data.serviceAmount);
    const commissionAmount = data.serviceAmount * (commissionRate / 100);

    const perf = this.perfRepo.create({
      ...data,
      commissionRate,
      commissionAmount,
      orderDate: data.orderDate || new Date().toISOString().split('T')[0],
    });

    return this.perfRepo.save(perf);
  }

  // 计算提成率
  private calculateCommissionRate(amount: number): number {
    if (amount >= 500) return 20;
    if (amount >= 200) return 15;
    return 10;
  }

  // 获取技师业绩列表
  async findByTechnician(technicianId: number, month?: string) {
    const query = this.perfRepo.createQueryBuilder('perf')
      .where('perf.technicianId = :technicianId', { technicianId });
    
    if (month) {
      query.andWhere('perf.orderDate LIKE :month', { month: `${month}%` });
    }
    
    return query.orderBy('perf.createdAt', 'DESC').getMany();
  }

  // 获取技师实时业绩
  async getRealtimePerformance(technicianId: number) {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.substring(0, 7) + '-01';

    // 今日业绩
    const todayStats = await this.perfRepo
      .createQueryBuilder('perf')
      .select('SUM(perf.commissionAmount)', 'totalCommission')
      .addSelect('COUNT(*)', 'orderCount')
      .addSelect('SUM(perf.serviceAmount)', 'totalSales')
      .where('perf.technicianId = :id', { id: technicianId })
      .andWhere('perf.orderDate = :today', { today })
      .getRawOne();

    // 本月业绩
    const monthStats = await this.perfRepo
      .createQueryBuilder('perf')
      .select('SUM(perf.commissionAmount)', 'totalCommission')
      .addSelect('COUNT(*)', 'orderCount')
      .addSelect('SUM(perf.serviceAmount)', 'totalSales')
      .where('perf.technicianId = :id', { id: technicianId })
      .andWhere('perf.orderDate >= :monthStart', { monthStart })
      .getRawOne();

    return {
      today: {
        commission: parseFloat(todayStats?.totalCommission || 0),
        orderCount: parseInt(todayStats?.orderCount || 0),
        sales: parseFloat(todayStats?.totalSales || 0),
      },
      month: {
        commission: parseFloat(monthStats?.totalCommission || 0),
        orderCount: parseInt(monthStats?.orderCount || 0),
        sales: parseFloat(monthStats?.totalSales || 0),
      },
    };
  }

  // 获取奖金规则
  async getBonusRules(storeId?: number) {
    const where: any = { status: 'active' };
    if (storeId) {
      where.storeId = storeId;
    }
    return this.bonusRuleRepo.find({
      where,
      order: { priority: 'ASC' },
    });
  }

  // 计算技师奖金
  async calculateBonus(technicianId: number, month: string) {
    const monthStart = month + '-01';
    const monthEnd = month + '-31';

    // 获取本月业绩
    const monthStats = await this.perfRepo
      .createQueryBuilder('perf')
      .select('SUM(perf.commissionAmount)', 'totalCommission')
      .addSelect('SUM(perf.serviceAmount)', 'totalSales')
      .addSelect('COUNT(*)', 'orderCount')
      .where('perf.technicianId = :id', { id: technicianId })
      .andWhere('perf.orderDate >= :start', { start: monthStart })
      .andWhere('perf.orderDate <= :end', { end: monthEnd })
      .getRawOne();

    const totalSales = parseFloat(monthStats?.totalSales || 0);

    // 获取奖金规则
    const rules = await this.getBonusRules();

    let totalBonus = 0;
    const bonuses: any[] = [];

    for (const rule of rules) {
      let eligible = false;

      if (rule.conditionType === 'monthly_sales' && totalSales >= rule.conditionValue) {
        eligible = true;
      }

      if (eligible) {
        const bonusAmount = rule.bonusType === 'fixed' 
          ? rule.bonusAmount 
          : totalSales * (rule.bonusAmount / 100);
        totalBonus += bonusAmount;

        bonuses.push({
          ruleId: rule.id,
          ruleName: rule.ruleName,
          amount: bonusAmount,
        });
      }
    }

    return {
      technicianId,
      month,
      totalSales,
      totalBonus,
      bonuses,
    };
  }
}
