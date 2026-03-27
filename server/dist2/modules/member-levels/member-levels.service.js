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
exports.MemberLevelsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const member_level_entity_1 = require("../../database/entities/member-level.entity");
const customer_level_entity_1 = require("../../database/entities/customer-level.entity");
const growth_record_entity_1 = require("../../database/entities/growth-record.entity");
let MemberLevelsService = class MemberLevelsService {
    constructor(memberLevelRepo, customerLevelRepo, growthRecordRepo) {
        this.memberLevelRepo = memberLevelRepo;
        this.customerLevelRepo = customerLevelRepo;
        this.growthRecordRepo = growthRecordRepo;
    }
    async findAllLevels() {
        return this.memberLevelRepo.find({ order: { threshold: 'ASC' } });
    }
    async getCustomerLevel(customerId) {
        let customerLevel = await this.customerLevelRepo.findOne({ where: { customerId } });
        if (!customerLevel) {
            customerLevel = this.customerLevelRepo.create({
                customerId,
                levelId: 1,
                growthValue: 0,
                totalPoints: 0,
                availablePoints: 0,
            });
            customerLevel = await this.customerLevelRepo.save(customerLevel);
        }
        const levels = await this.findAllLevels();
        const currentLevel = levels.find(l => l.id === customerLevel.levelId) || levels[0];
        return {
            ...customerLevel,
            levelName: currentLevel?.levelName,
            levelCode: currentLevel?.levelCode,
            discount: currentLevel?.discount,
            nextLevel: levels.find(l => l.threshold > (currentLevel?.threshold || 0)),
        };
    }
    async addGrowth(customerId, type, value, relatedId) {
        let customerLevel = await this.customerLevelRepo.findOne({ where: { customerId } });
        if (!customerLevel) {
            customerLevel = this.customerLevelRepo.create({
                customerId,
                levelId: 1,
                growthValue: 0,
                totalPoints: 0,
                availablePoints: 0,
            });
            customerLevel = await this.customerLevelRepo.save(customerLevel);
        }
        let growthValue = value;
        if (type === '签到')
            growthValue = 10;
        else if (type === '评价')
            growthValue = 20;
        else if (type === '推荐')
            growthValue = 100;
        customerLevel.growthValue += growthValue;
        customerLevel.totalPoints += growthValue;
        customerLevel.availablePoints += growthValue;
        await this.customerLevelRepo.save(customerLevel);
        const record = this.growthRecordRepo.create({
            customerId,
            growthType: type,
            growthValue,
            relatedId,
        });
        await this.growthRecordRepo.save(record);
        await this.checkUpgrade(customerId);
        return customerLevel;
    }
    async checkUpgrade(customerId) {
        const customerLevel = await this.customerLevelRepo.findOne({ where: { customerId } });
        if (!customerLevel)
            return customerLevel;
        const levels = await this.findAllLevels();
        let upgraded = false;
        for (const level of levels.reverse()) {
            if (customerLevel.growthValue >= level.threshold && level.id > customerLevel.levelId) {
                customerLevel.levelId = level.id;
                upgraded = true;
                break;
            }
        }
        if (upgraded) {
            await this.customerLevelRepo.save(customerLevel);
        }
        return customerLevel;
    }
    async getGrowthRecords(customerId) {
        return this.growthRecordRepo.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.MemberLevelsService = MemberLevelsService;
exports.MemberLevelsService = MemberLevelsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(member_level_entity_1.MemberLevel)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_level_entity_1.CustomerLevel)),
    __param(2, (0, typeorm_1.InjectRepository)(growth_record_entity_1.GrowthRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MemberLevelsService);
//# sourceMappingURL=member-levels.service.js.map