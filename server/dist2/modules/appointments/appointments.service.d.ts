import { Repository } from 'typeorm';
import { Appointment } from '../../database/entities/appointment.entity';
import { CustomersService } from '../customers/customers.service';
import { StoresService } from '../stores/stores.service';
import { EmployeesService } from '../employees/employees.service';
import { ServicesService } from '../services/services.service';
export declare class AppointmentsService {
    private appointmentRepo;
    private customersService;
    private storesService;
    private employeesService;
    private servicesService;
    constructor(appointmentRepo: Repository<Appointment>, customersService: CustomersService, storesService: StoresService, employeesService: EmployeesService, servicesService: ServicesService);
    findAll(filters?: {
        storeId?: number;
        customerId?: number;
        employeeId?: number;
        status?: string;
    }): Promise<Appointment[]>;
    findByDate(date: string, storeId?: number): Promise<Appointment[]>;
    findToday(storeId?: number): Promise<Appointment[]>;
    findOne(id: number): Promise<Appointment>;
    create(data: {
        customerId: number;
        storeId: number;
        employeeId: number;
        serviceId: number;
        appointmentDate: string;
        appointmentTime: string;
        durationHours?: number;
        notes?: string;
    }): Promise<Appointment>;
    checkConflict(employeeId: number, date: string, time: string, durationHours: number, excludeId?: number): Promise<boolean>;
    getAvailableTimes(employeeId: number, date: string, serviceDuration?: number): Promise<string[]>;
    confirm(id: number): Promise<Appointment>;
    complete(id: number): Promise<Appointment>;
    cancel(id: number, reason?: string): Promise<Appointment>;
    reject(id: number, reason: string): Promise<Appointment>;
}
