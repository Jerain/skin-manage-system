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
exports.SkinRecordsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const skin_record_entity_1 = require("../../database/entities/skin-record.entity");
const skin_comparison_entity_1 = require("../../database/entities/skin-comparison.entity");
let SkinRecordsService = class SkinRecordsService {
    constructor(skinRecordRepo, skinComparisonRepo) {
        this.skinRecordRepo = skinRecordRepo;
        this.skinComparisonRepo = skinComparisonRepo;
    }
    async create(data) {
        const record = this.skinRecordRepo.create({
            ...data,
            recordDate: new Date(),
        });
        return this.skinRecordRepo.save(record);
    }
    async findByCustomer(customerId) {
        return this.skinRecordRepo.find({
            where: { customerId },
            order: { recordDate: 'DESC' },
        });
    }
    async createComparison(data) {
        const comparison = this.skinComparisonRepo.create(data);
        return this.skinComparisonRepo.save(comparison);
    }
    async findComparisonsByCustomer(customerId) {
        return this.skinComparisonRepo.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.SkinRecordsService = SkinRecordsService;
exports.SkinRecordsService = SkinRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(skin_record_entity_1.SkinRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(skin_comparison_entity_1.SkinComparison)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SkinRecordsService);
//# sourceMappingURL=skin-records.service.js.map