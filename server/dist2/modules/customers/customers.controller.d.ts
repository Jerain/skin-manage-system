import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(): Promise<import("../../database/entities/customer.entity").Customer[]>;
    findOne(id: string): Promise<import("../../database/entities/customer.entity").Customer>;
    create(data: any): Promise<import("../../database/entities/customer.entity").Customer>;
    update(id: string, data: any): Promise<import("../../database/entities/customer.entity").Customer>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
