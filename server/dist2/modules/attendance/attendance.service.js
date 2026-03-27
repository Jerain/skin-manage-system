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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("../../database/entities/attendance.entity");
let AttendanceService = class AttendanceService {
    constructor(attendanceRepo, checkInRepo) {
        this.attendanceRepo = attendanceRepo;
        this.checkInRepo = checkInRepo;
    }
    async findAllAttendance(employeeId, startDate, endDate) {
        const where = {};
        if (employeeId)
            where.employeeId = employeeId;
        if (startDate && endDate) {
            where.date = (0, typeorm_2.Between)(new Date(startDate), new Date(endDate));
        }
        return this.attendanceRepo.find({
            where,
            relations: ['employee'],
            order: { date: 'DESC' },
        });
    }
    async findTodayAttendance(employeeId) {
        const today = new Date().toISOString().split('T')[0];
        const todayDate = new Date(today + 'T00:00:00');
        return this.attendanceRepo.findOne({
            where: { employeeId, date: todayDate },
            relations: ['employee'],
        });
    }
    async checkIn(employeeId, type = 'face') {
        const today = new Date().toISOString().split('T')[0];
        const todayDate = new Date(today + 'T00:00:00');
        const now = new Date();
        let attendance = await this.attendanceRepo.findOne({
            where: { employeeId, date: todayDate },
        });
        if (!attendance) {
            attendance = this.attendanceRepo.create({
                employeeId,
                date: new Date(today),
                checkIn: now,
                checkInType: type,
                status: 'normal',
            });
        }
        else if (attendance.checkIn) {
            throw new common_1.BadRequestException('今日已签到');
        }
        else {
            attendance.checkIn = now;
            attendance.checkInType = type;
        }
        return this.attendanceRepo.save(attendance);
    }
    async checkOut(employeeId, type = 'face') {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const todayDate = new Date(today + 'T00:00:00');
        const attendance = await this.attendanceRepo.findOne({
            where: { employeeId, date: todayDate },
        });
        if (!attendance) {
            throw new common_1.BadRequestException('今日未签到');
        }
        if (attendance.checkOut) {
            throw new common_1.BadRequestException('今日已签退');
        }
        attendance.checkOut = now;
        attendance.checkOutType = type;
        const checkInTime = new Date(attendance.checkIn).getHours();
        if (checkInTime > 9) {
            attendance.status = 'late';
        }
        return this.attendanceRepo.save(attendance);
    }
    async findAllCheckIns(customerId, storeId, date) {
        const where = {};
        if (customerId)
            where.customerId = customerId;
        if (storeId)
            where.storeId = storeId;
        if (date) {
            const startOfDay = new Date(date);
            const endOfDay = new Date(date);
            endOfDay.setDate(endOfDay.getDate() + 1);
            where.checkInTime = (0, typeorm_2.Between)(startOfDay, endOfDay);
        }
        return this.checkInRepo.find({
            where,
            order: { checkInTime: 'DESC' },
        });
    }
    async createCheckIn(data) {
        const checkIn = this.checkInRepo.create({
            customerId: data.customerId,
            storeId: data.storeId,
            appointmentId: data.appointmentId,
            checkInTime: new Date(),
            checkInType: data.type || 'manual',
        });
        return this.checkInRepo.save(checkIn);
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(1, (0, typeorm_1.InjectRepository)(attendance_entity_1.CheckIn)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map