import { Customer } from './customer.entity';
import { Store } from './store.entity';
import { Employee } from './employee.entity';
import { Service } from './service.entity';
export declare class Appointment {
    id: number;
    customerId: number;
    customer: Customer;
    storeId: number;
    store: Store;
    employeeId: number;
    employee: Employee;
    serviceId: number;
    service: Service;
    appointmentDate: Date;
    appointmentTime: string;
    durationHours: number;
    status: string;
    notes: string;
    cancelReason: string;
    createdAt: Date;
    updatedAt: Date;
}
