import { Repository } from 'typeorm';
import { Order } from '../../database/entities/order.entity';
import { CustomersService } from '../customers/customers.service';
import { AppointmentsService } from '../appointments/appointments.service';
export declare class OrdersService {
    private orderRepo;
    private customersService;
    private appointmentsService;
    constructor(orderRepo: Repository<Order>, customersService: CustomersService, appointmentsService: AppointmentsService);
    findAll(filters?: {
        customerId?: number;
        storeId?: number;
        status?: string;
        payStatus?: string;
    }): Promise<Order[]>;
    findOne(id: number): Promise<Order>;
    findByOrderNo(orderNo: string): Promise<Order>;
    create(data: {
        customerId: number;
        storeId: number;
        serviceId: number;
        appointmentId?: number;
        employeeId?: number;
        amount: number;
        payType?: string;
    }): Promise<Order>;
    private generateOrderNo;
    pay(id: number, payType: string): Promise<Order>;
    complete(id: number): Promise<Order>;
    cancel(id: number): Promise<Order>;
    refund(id: number): Promise<Order>;
}
