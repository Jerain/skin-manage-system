import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(customerId?: string, storeId?: string, status?: string, payStatus?: string): Promise<import("../../database/entities/order.entity").Order[]>;
    findOne(id: string): Promise<import("../../database/entities/order.entity").Order>;
    findByOrderNo(orderNo: string): Promise<import("../../database/entities/order.entity").Order>;
    create(data: any): Promise<import("../../database/entities/order.entity").Order>;
    pay(id: string, payType: string): Promise<import("../../database/entities/order.entity").Order>;
    complete(id: string): Promise<import("../../database/entities/order.entity").Order>;
    cancel(id: string): Promise<import("../../database/entities/order.entity").Order>;
    refund(id: string): Promise<import("../../database/entities/order.entity").Order>;
}
