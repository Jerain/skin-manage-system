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
exports.AdminUser = exports.CheckIn = exports.Attendance = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
let Attendance = class Attendance {
};
exports.Attendance = Attendance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Attendance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'employee_id' }),
    __metadata("design:type", Number)
], Attendance.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], Attendance.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Attendance.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'check_in', nullable: true }),
    __metadata("design:type", Date)
], Attendance.prototype, "checkIn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'check_out', nullable: true }),
    __metadata("design:type", Date)
], Attendance.prototype, "checkOut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'check_in_type', length: 20, nullable: true }),
    __metadata("design:type", String)
], Attendance.prototype, "checkInType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'check_out_type', length: 20, nullable: true }),
    __metadata("design:type", String)
], Attendance.prototype, "checkOutType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'normal' }),
    __metadata("design:type", String)
], Attendance.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Attendance.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Attendance.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Attendance.prototype, "updatedAt", void 0);
exports.Attendance = Attendance = __decorate([
    (0, typeorm_1.Entity)('attendances')
], Attendance);
let CheckIn = class CheckIn {
};
exports.CheckIn = CheckIn;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CheckIn.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", Number)
], CheckIn.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'store_id' }),
    __metadata("design:type", Number)
], CheckIn.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appointment_id', nullable: true }),
    __metadata("design:type", Number)
], CheckIn.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'check_in_time' }),
    __metadata("design:type", Date)
], CheckIn.prototype, "checkInTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'check_in_type', default: 'manual' }),
    __metadata("design:type", String)
], CheckIn.prototype, "checkInType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CheckIn.prototype, "createdAt", void 0);
exports.CheckIn = CheckIn = __decorate([
    (0, typeorm_1.Entity)('check_ins')
], CheckIn);
let AdminUser = class AdminUser {
};
exports.AdminUser = AdminUser;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AdminUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], AdminUser.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AdminUser.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], AdminUser.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'admin' }),
    __metadata("design:type", String)
], AdminUser.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'store_id', nullable: true }),
    __metadata("design:type", Number)
], AdminUser.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], AdminUser.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AdminUser.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AdminUser.prototype, "updatedAt", void 0);
exports.AdminUser = AdminUser = __decorate([
    (0, typeorm_1.Entity)('admin_users')
], AdminUser);
//# sourceMappingURL=attendance.entity.js.map