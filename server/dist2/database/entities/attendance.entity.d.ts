import { Employee } from './employee.entity';
export declare class Attendance {
    id: number;
    employeeId: number;
    employee: Employee;
    date: Date;
    checkIn: Date;
    checkOut: Date;
    checkInType: string;
    checkOutType: string;
    status: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CheckIn {
    id: number;
    customerId: number;
    storeId: number;
    appointmentId: number;
    checkInTime: Date;
    checkInType: string;
    createdAt: Date;
}
export declare class AdminUser {
    id: number;
    username: string;
    password: string;
    name: string;
    role: string;
    storeId: number;
    status: number;
    createdAt: Date;
    updatedAt: Date;
}
