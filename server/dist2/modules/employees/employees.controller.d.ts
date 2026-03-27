import { EmployeesService } from './employees.service';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    findAll(storeId?: string): Promise<import("../../database/entities/employee.entity").Employee[]>;
    findByStore(storeId: string): Promise<import("../../database/entities/employee.entity").Employee[]>;
    findOne(id: string): Promise<import("../../database/entities/employee.entity").Employee>;
    create(data: any): Promise<import("../../database/entities/employee.entity").Employee>;
    update(id: string, data: any): Promise<import("../../database/entities/employee.entity").Employee>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
