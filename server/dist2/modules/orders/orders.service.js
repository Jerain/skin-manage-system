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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../database/entities/order.entity");
const customers_service_1 = require("../customers/customers.service");
const appointments_service_1 = require("../appointments/appointments.service");
let OrdersService = class OrdersService {
    constructor(orderRepo, customersService, appointmentsService) {
        this.orderRepo = orderRepo;
        this.customersService = customersService;
        this.appointmentsService = appointmentsService;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.customerId)
            where.customerId = filters.customerId;
        if (filters?.storeId)
            where.storeId = filters.storeId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.payStatus)
            where.payStatus = filters.payStatus;
        return this.orderRepo.find({
            where,
            relations: ['customer', 'store', 'service', 'employee', 'appointment'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['customer', 'store', 'service', 'employee', 'appointment'],
        });
        if (!order)
            throw new common_1.NotFoundException('订单不存在');
        return order;
    }
    async findByOrderNo(orderNo) {
        const order = await this.orderRepo.findOne({
            where: { orderNo },
            relations: ['customer', 'store', 'service', 'employee', 'appointment'],
        });
        if (!order)
            throw new common_1.NotFoundException('订单不存在');
        return order;
    }
    async create(data) {
        const customer = await this.customersService.findOne(data.customerId);
        const order = this.orderRepo.create({
            orderNo: this.generateOrderNo(),
            customerId: data.customerId,
            storeId: data.storeId,
            serviceId: data.serviceId,
            appointmentId: data.appointmentId,
            employeeId: data.employeeId,
            amount: data.amount,
            actualAmount: data.amount,
            payType: data.payType,
            payStatus: 'unpaid',
            status: 'pending',
        });
        return this.orderRepo.save(order);
    }
    generateOrderNo() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `SK${dateStr}${random}`;
    }
    async pay(id, payType) {
        const order = await this.findOne(id);
        if (order.payStatus === 'paid') {
            throw new common_1.BadRequestException('订单已支付');
        }
        let actualAmount = order.amount;
        if (payType === 'balance') {
            const customer = await this.customersService.findOne(order.customerId);
            if (customer.balance < order.amount) {
                throw new common_1.BadRequestException('余额不足');
            }
            await this.customersService.updateBalance(order.customerId, order.amount, 'subtract');
        }
        await this.orderRepo.update(id, {
            payType,
            payStatus: 'paid',
            payTime: new Date(),
            actualAmount,
            status: 'processing',
        });
        if (order.appointmentId) {
            await this.appointmentsService.confirm(order.appointmentId);
        }
        return this.findOne(id);
    }
    async complete(id) {
        const order = await this.findOne(id);
        await this.orderRepo.update(id, {
            status: 'completed',
            confirmTime: new Date(),
        });
        await this.customersService.updatePoints(order.customerId, Math.floor(order.amount), 'add');
        return this.findOne(id);
    }
    async cancel(id) {
        const order = await this.findOne(id);
        if (order.payStatus === 'paid') {
            await this.customersService.updateBalance(order.customerId, order.actualAmount, 'add');
        }
        await this.orderRepo.update(id, {
            status: 'cancelled',
            payStatus: 'refunded',
        });
        if (order.appointmentId) {
            await this.appointmentsService.cancel(order.appointmentId, '订单取消');
        }
        return this.findOne(id);
    }
    async refund(id) {
        const order = await this.findOne(id);
        if (order.payStatus !== 'paid') {
            throw new common_1.BadRequestException('订单未支付，无法退款');
        }
        await this.orderRepo.update(id, {
            payStatus: 'refunded',
        });
        await this.customersService.updateBalance(order.customerId, order.actualAmount, 'add');
        return this.findOne(id);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        customers_service_1.CustomersService,
        appointments_service_1.AppointmentsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map