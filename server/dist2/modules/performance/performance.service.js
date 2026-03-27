"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const performance_record_entity_1 = require("../../database/entities/performance-record.entity");
const bonus_rule_entity_1 = require("../../database/entities/bonus-rule.entity");
const technician_bonus_entity_1 = require("../../database/entities/technician-bonus.entity");
let PerformanceService = class PerformanceService {
    constructor(perfRepo, bonusRuleRepo, technicianBonusRepo) {
        this.perfRepo = perfRepo;
        this.bonusRuleRepo = bonusRuleRepo;
        this.technicianBonusRepo = technicianBonusRepo;
    }
    async createPerformance(data) {
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
    calculateCommissionRate(amount) {
        if (amount >= 500)
            return 20;
        if (amount >= 200)
            return 15;
        return 10;
    }
    async findByTechnician(technicianId, month) {
        const query = this.perfRepo.createQueryBuilder('perf')
            .where('perf.technicianId = :technicianId', { technicianId });
        if (month) {
            query.andWhere('perf.orderDate LIKE :month', { month: `${month}%` });
        }
        return query.orderBy('perf.createdAt', 'DESC').getMany();
    }
    async getRealtimePerformance(technicianId) {
        const today = new Date().toISOString().split('T')[0];
        const monthStart = today.substring(0, 7) + '-01';
        const todayStats = await this.perfRepo
            .createQueryBuilder('perf')
            .select('SUM(perf.commissionAmount)', 'totalCommission')
            .addSelect('COUNT(*)', 'orderCount')
            .addSelect('SUM(perf.serviceAmount)', 'totalSales')
            .where('perf.technicianId = :id', { id: technicianId })
            .andWhere('perf.orderDate = :today', { today })
            .getRawOne();
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
    async getBonusRules(storeId) {
        const where = { status: 'active' };
        if (storeId) {
            where.storeId = storeId;
        }
        return this.bonusRuleRepo.find({
            where,
            order: { priority: 'ASC' },
        });
    }
    async calculateBonus(technicianId, month) {
        const monthStart = month + '-01';
        const monthEnd = month + '-31';
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
        const rules = await this.getBonusRules();
        let totalBonus = 0;
        const bonuses = [];
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
};
exports.PerformanceService = PerformanceService;
exports.PerformanceService = PerformanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(performance_record_entity_1.PerformanceRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(bonus_rule_entity_1.BonusRule)),
    __param(2, (0, typeorm_1.InjectRepository)(technician_bonus_entity_1.TechnicianBonus)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PerformanceService);
//# sourceMappingURL=performance.service.js.map