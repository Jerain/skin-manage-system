import { Repository } from 'typeorm';
import { Customer } from '../../database/entities/customer.entity';
export declare class CustomersService {
    private customerRepo;
    constructor(customerRepo: Repository<Customer>);
    findAll(): Promise<Customer[]>;
    findOne(id: number): Promise<Customer>;
    findByPhone(phone: string): Promise<Customer>;
    findByFaceToken(faceToken: string): Promise<Customer>;
    create(data: Partial<Customer>): Promise<Customer>;
    update(id: number, data: Partial<Customer>): Promise<Customer>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
    validatePassword(customer: Customer, password: string): Promise<boolean>;
    updateBalance(id: number, amount: number, type: 'add' | 'subtract'): Promise<Customer>;
    updatePoints(id: number, points: number, type: 'add' | 'subtract'): Promise<Customer>;
}
