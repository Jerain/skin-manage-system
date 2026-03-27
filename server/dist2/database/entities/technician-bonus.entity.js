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
exports.TechnicianBonus = void 0;
const typeorm_1 = require("typeorm");
let TechnicianBonus = class TechnicianBonus {
};
exports.TechnicianBonus = TechnicianBonus;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TechnicianBonus.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TechnicianBonus.prototype, "technicianId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TechnicianBonus.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TechnicianBonus.prototype, "bonusRuleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], TechnicianBonus.prototype, "bonusType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], TechnicianBonus.prototype, "bonusAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 7, comment: '2026-03' }),
    __metadata("design:type", String)
], TechnicianBonus.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], TechnicianBonus.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TechnicianBonus.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TechnicianBonus.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], TechnicianBonus.prototype, "paidAt", void 0);
exports.TechnicianBonus = TechnicianBonus = __decorate([
    (0, typeorm_1.Entity)('technician_bonuses'),
    (0, typeorm_1.Index)(['technicianId']),
    (0, typeorm_1.Index)(['month'])
], TechnicianBonus);
//# sourceMappingURL=technician-bonus.entity.js.map