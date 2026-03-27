import { AppointmentsService } from './appointments.service';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    findAll(storeId?: string, customerId?: string, employeeId?: string, status?: string): Promise<import("../../database/entities/appointment.entity").Appointment[]>;
    findToday(storeId?: string): Promise<import("../../database/entities/appointment.entity").Appointment[]>;
    findByDate(date: string, storeId?: string): Promise<import("../../database/entities/appointment.entity").Appointment[]>;
    getAvailableTimes(employeeId: string, date: string, duration?: string): Promise<string[]>;
    findOne(id: string): Promise<import("../../database/entities/appointment.entity").Appointment>;
    create(data: any): Promise<import("../../database/entities/appointment.entity").Appointment>;
    confirm(id: string): Promise<import("../../database/entities/appointment.entity").Appointment>;
    complete(id: string): Promise<import("../../database/entities/appointment.entity").Appointment>;
    cancel(id: string, reason?: string): Promise<import("../../database/entities/appointment.entity").Appointment>;
    reject(id: string, reason: string): Promise<import("../../database/entities/appointment.entity").Appointment>;
}
