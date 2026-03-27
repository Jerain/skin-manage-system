import { Customer } from './customer.entity';
import { Store } from './store.entity';
import { Employee } from './employee.entity';
import { Service } from './service.entity';
import { Appointment } from './appointment.entity';
export declare class Order {
    id: number;
    orderNo: string;
    customerId: number;
    customer: Customer;
    appointmentId: number;
    appointment: Appointment;
    storeId: number;
    store: Store;
    serviceId: number;
    service: Service;
    employeeId: number;
    employee: Employee;
    amount: number;
    actualAmount: number;
    payType: string;
    payStatus: string;
    status: string;
    payTime: Date;
    confirmTime: Date;
    createdAt: Date;
    updatedAt: Date;
}
