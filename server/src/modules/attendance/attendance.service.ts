import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, CheckIn } from '../../database/entities/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(CheckIn)
    private checkInRepo: Repository<CheckIn>,
  ) {}

  // Attendance methods
  async findAllAttendance(employeeId?: number, startDate?: string, endDate?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }
    
    return this.attendanceRepo.find({
      where,
      relations: ['employee'],
      order: { date: 'DESC' },
    });
  }

  async findTodayAttendance(employeeId: number) {
    const today = new Date().toISOString().split('T')[0];
    const todayDate = new Date(today + 'T00:00:00');
    return this.attendanceRepo.findOne({
      where: { employeeId, date: todayDate },
      relations: ['employee'],
    });
  }

  async checkIn(employeeId: number, type: string = 'face') {
    const today = new Date().toISOString().split('T')[0];
    const todayDate = new Date(today + 'T00:00:00');
    const now = new Date();
    
    // Check if already checked in today
    let attendance = await this.attendanceRepo.findOne({
      where: { employeeId, date: todayDate },
    });

    if (!attendance) {
      // Create new attendance record
      attendance = this.attendanceRepo.create({
        employeeId,
        date: new Date(today),
        checkIn: now,
        checkInType: type,
        status: 'normal',
      });
    } else if (attendance.checkIn) {
      throw new BadRequestException('今日已签到');
    } else {
      attendance.checkIn = now;
      attendance.checkInType = type;
    }

    return this.attendanceRepo.save(attendance);
  }

  async checkOut(employeeId: number, type: string = 'face') {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // Use local date to match database
    const todayDate = new Date(today + 'T00:00:00');
    const attendance = await this.attendanceRepo.findOne({
      where: { employeeId, date: todayDate },
    });

    if (!attendance) {
      throw new BadRequestException('今日未签到');
    }

    if (attendance.checkOut) {
      throw new BadRequestException('今日已签退');
    }

    attendance.checkOut = now;
    attendance.checkOutType = type;

    // Calculate if late
    const checkInTime = new Date(attendance.checkIn).getHours();
    if (checkInTime > 9) {
      attendance.status = 'late';
    }

    return this.attendanceRepo.save(attendance);
  }

  // CheckIn methods
  async findAllCheckIns(customerId?: number, storeId?: number, date?: string) {
    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (storeId) where.storeId = storeId;
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      where.checkInTime = Between(startOfDay, endOfDay);
    }

    return this.checkInRepo.find({
      where,
      order: { checkInTime: 'DESC' },
    });
  }

  async createCheckIn(data: { customerId: number; storeId: number; appointmentId?: number; type?: string }) {
    const checkIn = this.checkInRepo.create({
      customerId: data.customerId,
      storeId: data.storeId,
      appointmentId: data.appointmentId,
      checkInTime: new Date(),
      checkInType: data.type || 'manual',
    });

    return this.checkInRepo.save(checkIn);
  }
}
