import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    findAllAttendance(employeeId?: string, startDate?: string, endDate?: string): Promise<import("../../database/entities/attendance.entity").Attendance[]>;
    findTodayAttendance(employeeId: string): Promise<import("../../database/entities/attendance.entity").Attendance>;
    checkIn(body: {
        employeeId: number;
        type?: string;
    }): Promise<import("../../database/entities/attendance.entity").Attendance>;
    checkOut(body: {
        employeeId: number;
        type?: string;
    }): Promise<import("../../database/entities/attendance.entity").Attendance>;
    findAllCheckIns(customerId?: string, storeId?: string, date?: string): Promise<import("../../database/entities/attendance.entity").CheckIn[]>;
    createCheckIn(body: {
        customerId: number;
        storeId: number;
        appointmentId?: number;
        type?: string;
    }): Promise<import("../../database/entities/attendance.entity").CheckIn>;
}
