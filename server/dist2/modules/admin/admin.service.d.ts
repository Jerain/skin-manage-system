import { Repository } from 'typeorm';
import { AdminUser } from '../../database/entities/attendance.entity';
export declare class AdminService {
    private adminRepo;
    constructor(adminRepo: Repository<AdminUser>);
    findAll(): Promise<AdminUser[]>;
    findOne(id: number): Promise<AdminUser>;
    findByUsername(username: string): Promise<AdminUser>;
    create(data: Partial<AdminUser>): Promise<AdminUser>;
    update(id: number, data: Partial<AdminUser>): Promise<AdminUser>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
    validateCredentials(username: string, password: string): Promise<AdminUser | null>;
}
