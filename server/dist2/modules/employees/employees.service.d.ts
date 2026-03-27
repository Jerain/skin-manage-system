import { Repository } from 'typeorm';
import { Employee } from '../../database/entities/employee.entity';
export declare class EmployeesService {
    private employeeRepo;
    constructor(employeeRepo: Repository<Employee>);
    findAll(storeId?: number): Promise<Employee[]>;
    findByStore(storeId: number): Promise<Employee[]>;
    findOne(id: number): Promise<Employee>;
    findByPhone(phone: string): Promise<Employee>;
    findByFaceToken(faceToken: string): Promise<Employee>;
    create(data: Partial<Employee>): Promise<Employee>;
    update(id: number, data: Partial<Employee>): Promise<Employee>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
    validatePassword(employee: Employee, password: string): Promise<boolean>;
}
