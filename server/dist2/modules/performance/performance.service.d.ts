import { Repository } from 'typeorm';
import { PerformanceRecord } from '../../database/entities/performance-record.entity';
import { BonusRule } from '../../database/entities/bonus-rule.entity';
import { TechnicianBonus } from '../../database/entities/technician-bonus.entity';
export declare class PerformanceService {
    private perfRepo;
    private bonusRuleRepo;
    private technicianBonusRepo;
    constructor(perfRepo: Repository<PerformanceRecord>, bonusRuleRepo: Repository<BonusRule>, technicianBonusRepo: Repository<TechnicianBonus>);
    createPerformance(data: {
        technicianId: number;
        orderId: number;
        appointmentId?: number;
        serviceId: number;
        serviceName: string;
        serviceAmount: number;
        orderDate?: string;
    }): Promise<PerformanceRecord>;
    private calculateCommissionRate;
    findByTechnician(technicianId: number, month?: string): Promise<PerformanceRecord[]>;
    getRealtimePerformance(technicianId: number): Promise<{
        today: {
            commission: number;
            orderCount: number;
            sales: number;
        };
        month: {
            commission: number;
            orderCount: number;
            sales: number;
        };
    }>;
    getBonusRules(storeId?: number): Promise<BonusRule[]>;
    calculateBonus(technicianId: number, month: string): Promise<{
        technicianId: number;
        month: string;
        totalSales: number;
        totalBonus: number;
        bonuses: any[];
    }>;
}
