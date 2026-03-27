import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../database/entities/order.entity';
import { CustomersService } from '../customers/customers.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private customersService: CustomersService,
    private appointmentsService: AppointmentsService,
  ) {}

  async findAll(filters?: { customerId?: number; storeId?: number; status?: string; payStatus?: string }) {
    const where: any = {};
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.storeId) where.storeId = filters.storeId;
    if (filters?.status) where.status = filters.status;
    if (filters?.payStatus) where.payStatus = filters.payStatus;

    return this.orderRepo.find({
      where,
      relations: ['customer', 'store', 'service', 'employee', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['customer', 'store', 'service', 'employee', 'appointment'],
    });
    if (!order) throw new NotFoundException('订单不存在');
    return order;
  }

  async findByOrderNo(orderNo: string) {
    const order = await this.orderRepo.findOne({
      where: { orderNo },
      relations: ['customer', 'store', 'service', 'employee', 'appointment'],
    });
    if (!order) throw new NotFoundException('订单不存在');
    return order;
  }

  async create(data: {
    customerId: number;
    storeId: number;
    serviceId: number;
    appointmentId?: number;
    employeeId?: number;
    amount: number;
    payType?: string;
  }) {
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

  private generateOrderNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SK${dateStr}${random}`;
  }

  async pay(id: number, payType: string) {
    const order = await this.findOne(id);
    
    if (order.payStatus === 'paid') {
      throw new BadRequestException('订单已支付');
    }

    let actualAmount = order.amount;

    // Handle balance payment
    if (payType === 'balance') {
      const customer = await this.customersService.findOne(order.customerId);
      if (customer.balance < order.amount) {
        throw new BadRequestException('余额不足');
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

    // If there's an appointment, confirm it
    if (order.appointmentId) {
      await this.appointmentsService.confirm(order.appointmentId);
    }

    return this.findOne(id);
  }

  async complete(id: number) {
    const order = await this.findOne(id);
    
    await this.orderRepo.update(id, {
      status: 'completed',
      confirmTime: new Date(),
    });

    // Add points
    await this.customersService.updatePoints(order.customerId, Math.floor(order.amount), 'add');

    return this.findOne(id);
  }

  async cancel(id: number) {
    const order = await this.findOne(id);
    
    if (order.payStatus === 'paid') {
      // Refund to balance
      await this.customersService.updateBalance(order.customerId, order.actualAmount, 'add');
    }

    await this.orderRepo.update(id, {
      status: 'cancelled',
      payStatus: 'refunded',
    });

    // Cancel associated appointment
    if (order.appointmentId) {
      await this.appointmentsService.cancel(order.appointmentId, '订单取消');
    }

    return this.findOne(id);
  }

  async refund(id: number) {
    const order = await this.findOne(id);
    
    if (order.payStatus !== 'paid') {
      throw new BadRequestException('订单未支付，无法退款');
    }

    await this.orderRepo.update(id, {
      payStatus: 'refunded',
    });

    // Refund to balance
    await this.customersService.updateBalance(order.customerId, order.actualAmount, 'add');

    return this.findOne(id);
  }
}
