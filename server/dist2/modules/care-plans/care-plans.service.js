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
exports.CarePlansService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const care_plan_entity_1 = require("../../database/entities/care-plan.entity");
const care_plan_item_entity_1 = require("../../database/entities/care-plan-item.entity");
let CarePlansService = class CarePlansService {
    constructor(carePlanRepo, carePlanItemRepo) {
        this.carePlanRepo = carePlanRepo;
        this.carePlanItemRepo = carePlanItemRepo;
    }
    async create(data) {
        const carePlan = this.carePlanRepo.create(data);
        const saved = await this.carePlanRepo.save(carePlan);
        if (data.planItems && data.planItems.length > 0) {
            for (const item of data.planItems) {
                const planItem = this.carePlanItemRepo.create({
                    planId: saved.id,
                    serviceId: item.serviceId,
                    plannedMonth: item.month,
                    suggestedDate: item.suggestedDate,
                    status: 'pending',
                });
                await this.carePlanItemRepo.save(planItem);
            }
        }
        return this.findByCustomer(data.customerId);
    }
    async findByCustomer(customerId) {
        return this.carePlanRepo.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        const plan = await this.carePlanRepo.findOne({ where: { id } });
        if (plan) {
            const items = await this.carePlanItemRepo.find({
                where: { planId: id },
                order: { plannedMonth: 'ASC' },
            });
            return { ...plan, items };
        }
        return plan;
    }
};
exports.CarePlansService = CarePlansService;
exports.CarePlansService = CarePlansService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(care_plan_entity_1.CarePlan)),
    __param(1, (0, typeorm_1.InjectRepository)(care_plan_item_entity_1.CarePlanItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CarePlansService);
//# sourceMappingURL=care-plans.service.js.map