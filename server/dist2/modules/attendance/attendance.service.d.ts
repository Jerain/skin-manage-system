import { Repository } from 'typeorm';
import { Attendance, CheckIn } from '../../database/entities/attendance.entity';
export declare class AttendanceService {
    private attendanceRepo;
    private checkInRepo;
    constructor(attendanceRepo: Repository<Attendance>, checkInRepo: Repository<CheckIn>);
    findAllAttendance(employeeId?: number, startDate?: string, endDate?: string): Promise<Attendance[]>;
    findTodayAttendance(employeeId: number): Promise<Attendance>;
    checkIn(employeeId: number, type?: string): Promise<Attendance>;
    checkOut(employeeId: number, type?: string): Promise<Attendance>;
    findAllCheckIns(customerId?: number, storeId?: number, date?: string): Promise<CheckIn[]>;
    createCheckIn(data: {
        customerId: number;
        storeId: number;
        appointmentId?: number;
        type?: string;
    }): Promise<CheckIn>;
}
