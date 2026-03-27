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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonusRule = void 0;
const typeorm_1 = require("typeorm");
let BonusRule = class BonusRule {
};
exports.BonusRule = BonusRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BonusRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], BonusRule.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], BonusRule.prototype, "ruleName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: '基础提成/业绩奖励/好评奖励/满勤奖' }),
    __metadata("design:type", String)
], BonusRule.prototype, "ruleType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: 'service_amount/monthly_sales/praise_rate/attendance' }),
    __metadata("design:type", String)
], BonusRule.prototype, "conditionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BonusRule.prototype, "conditionValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, comment: 'percentage/fixed' }),
    __metadata("design:type", String)
], BonusRule.prototype, "bonusType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BonusRule.prototype, "bonusAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BonusRule.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'active' }),
    __metadata("design:type", String)
], BonusRule.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BonusRule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BonusRule.prototype, "updatedAt", void 0);
exports.BonusRule = BonusRule = __decorate([
    (0, typeorm_1.Entity)('bonus_rules'),
    (0, typeorm_1.Index)(['storeId'])
], BonusRule);
//# sourceMappingURL=bonus-rule.entity.js.map