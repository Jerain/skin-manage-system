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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("../../database/entities/appointment.entity");
const customers_service_1 = require("../customers/customers.service");
const stores_service_1 = require("../stores/stores.service");
const employees_service_1 = require("../employees/employees.service");
const services_service_1 = require("../services/services.service");
let AppointmentsService = class AppointmentsService {
    constructor(appointmentRepo, customersService, storesService, employeesService, servicesService) {
        this.appointmentRepo = appointmentRepo;
        this.customersService = customersService;
        this.storesService = storesService;
        this.employeesService = employeesService;
        this.servicesService = servicesService;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.storeId)
            where.storeId = filters.storeId;
        if (filters?.customerId)
            where.customerId = filters.customerId;
        if (filters?.employeeId)
            where.employeeId = filters.employeeId;
        if (filters?.status)
            where.status = filters.status;
        return this.appointmentRepo.find({
            where,
            relations: ['customer', 'store', 'employee', 'service'],
            order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
        });
    }
    async findByDate(date, storeId) {
        const where = { appointmentDate: date };
        if (storeId)
            where.storeId = storeId;
        return this.appointmentRepo.find({
            where,
            relations: ['customer', 'store', 'employee', 'service'],
            order: { appointmentTime: 'ASC' },
        });
    }
    async findToday(storeId) {
        const today = new Date().toISOString().split('T')[0];
        return this.findByDate(today, storeId);
    }
    async findOne(id) {
        const appointment = await this.appointmentRepo.findOne({
            where: { id },
            relations: ['customer', 'store', 'employee', 'service'],
        });
        if (!appointment)
            throw new common_1.NotFoundException('预约不存在');
        return appointment;
    }
    async create(data) {
        await this.customersService.findOne(data.customerId);
        await this.storesService.findOne(data.storeId);
        await this.employeesService.findOne(data.employeeId);
        await this.servicesService.findOne(data.serviceId);
        const durationHours = data.durationHours || 1;
        const hasConflict = await this.checkConflict(data.employeeId, data.appointmentDate, data.appointmentTime, durationHours);
        if (hasConflict) {
            throw new common_1.BadRequestException('该技师此时段已被预约，请选择其他时间');
        }
        const appointment = this.appointmentRepo.create({
            ...data,
            durationHours,
            status: 'pending',
        });
        return this.appointmentRepo.save(appointment);
    }
    async checkConflict(employeeId, date, time, durationHours, excludeId) {
        console.log(`[ConflictCheck] employeeId=${employeeId}, date=${date}, time=${time}, durationHours=${durationHours}`);
        const [hours, minutes] = time.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + durationHours * 60;
        console.log(`[ConflictCheck] startMinutes=${startMinutes}, endMinutes=${endMinutes}`);
        const dateStr = date.split('T')[0];
        const allAppointments = await this.appointmentRepo
            .createQueryBuilder('apt')
            .where('apt.employeeId = :employeeId', { employeeId })
            .andWhere('DATE(apt.appointmentDate) = :dateStr', { dateStr })
            .getMany();
        console.log(`[ConflictCheck] found ${allAppointments.length} appointments (dateStr=${dateStr})`);
        const appointments = allAppointments.filter(apt => apt.status !== 'cancelled');
        for (const apt of appointments) {
            if (excludeId && apt.id === excludeId)
                continue;
            const aptTimeStr = apt.appointmentTime.split(':').slice(0, 2).join(':');
            const [aptHours, aptMinutes] = aptTimeStr.split(':').map(Number);
            const aptStartMinutes = aptHours * 60 + aptMinutes;
            const aptEndMinutes = aptStartMinutes + Number(apt.durationHours) * 60;
            if (startMinutes < aptEndMinutes && endMinutes > aptStartMinutes) {
                return true;
            }
        }
        return false;
    }
    async getAvailableTimes(employeeId, date, serviceDuration = 60) {
        const durationHours = serviceDuration / 60;
        const appointments = await this.appointmentRepo.find({
            where: {
                employeeId,
                appointmentDate: new Date(date),
                status: 'pending',
            },
            order: { appointmentTime: 'ASC' },
        });
        const availableSlots = [];
        const startHour = 9;
        const endHour = 21;
        for (let hour = startHour; hour < endHour; hour++) {
            const time = `${hour.toString().padStart(2, '0')}:00`;
            const hasConflict = await this.checkConflict(employeeId, date, time, durationHours);
            if (!hasConflict) {
                availableSlots.push(time);
            }
        }
        return availableSlots;
    }
    async confirm(id) {
        await this.appointmentRepo.update(id, { status: 'confirmed' });
        return this.findOne(id);
    }
    async complete(id) {
        await this.appointmentRepo.update(id, { status: 'completed' });
        return this.findOne(id);
    }
    async cancel(id, reason) {
        await this.appointmentRepo.update(id, {
            status: 'cancelled',
            cancelReason: reason || '客户取消',
        });
        return this.findOne(id);
    }
    async reject(id, reason) {
        await this.appointmentRepo.update(id, {
            status: 'rejected',
            cancelReason: reason,
        });
        return this.findOne(id);
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        customers_service_1.CustomersService,
        stores_service_1.StoresService,
        employees_service_1.EmployeesService,
        services_service_1.ServicesService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map