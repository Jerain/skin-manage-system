import { JwtService } from '@nestjs/jwt';
import { CustomersService } from '../customers/customers.service';
import { EmployeesService } from '../employees/employees.service';
import { AdminService } from '../admin/admin.service';
export declare class AuthService {
    private jwtService;
    private customersService;
    private employeesService;
    private adminService;
    constructor(jwtService: JwtService, customersService: CustomersService, employeesService: EmployeesService, adminService: AdminService);
    customerLogin(phone: string, password: string): Promise<{
        access_token: string;
        customer: {
            id: number;
            name: string;
            phone: string;
            avatar: string;
            level: number;
            balance: number;
            points: number;
        };
    }>;
    customerRegister(data: {
        phone: string;
        password: string;
        name?: string;
    }): Promise<{
        access_token: string;
        customer: {
            id: number;
            name: string;
            phone: string;
        };
    }>;
    employeeLogin(phone: string, password: string): Promise<{
        access_token: string;
        employee: {
            id: number;
            name: string;
            phone: string;
            role: string;
            position: string;
            storeId: number;
            avatar: string;
        };
    }>;
    adminLogin(username: string, password: string): Promise<{
        access_token: string;
        admin: {
            id: number;
            username: string;
            name: string;
            role: string;
            storeId: number;
        };
    }>;
    faceLogin(faceToken: string, userType: 'customer' | 'employee'): Promise<{
        access_token: string;
        employee: {
            id: number;
            name: string;
            phone: string;
            role: string;
            position: string;
            storeId: number;
            avatar: string;
        };
        customer?: undefined;
    } | {
        access_token: string;
        customer: {
            id: number;
            name: string;
            phone: string;
            avatar: string;
            level: number;
            balance: number;
            points: number;
        };
        employee?: undefined;
    }>;
    validateToken(token: string): any;
}
