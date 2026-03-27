import { PerformanceService } from './performance.service';
export declare class PerformanceController {
    private readonly performanceService;
    constructor(performanceService: PerformanceService);
    createPerformance(data: any): Promise<import("../../database/entities/performance-record.entity").PerformanceRecord>;
    getTechnicianPerformance(id: string, month?: string): Promise<import("../../database/entities/performance-record.entity").PerformanceRecord[]>;
    getRealtimePerformance(id: string): Promise<{
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
    getBonusRules(storeId?: string): Promise<import("../../database/entities/bonus-rule.entity").BonusRule[]>;
    getTechnicianBonus(technicianId: string, month: string): Promise<{
        technicianId: number;
        month: string;
        totalSales: number;
        totalBonus: number;
        bonuses: any[];
    }>;
}
