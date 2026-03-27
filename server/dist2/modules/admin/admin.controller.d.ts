import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    findAll(): Promise<import("../../database/entities/attendance.entity").AdminUser[]>;
    findOne(id: string): Promise<import("../../database/entities/attendance.entity").AdminUser>;
    create(data: any): Promise<import("../../database/entities/attendance.entity").AdminUser>;
    update(id: string, data: any): Promise<import("../../database/entities/attendance.entity").AdminUser>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
