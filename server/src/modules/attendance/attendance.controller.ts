import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Employee attendance
  @Get()
  findAllAttendance(
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.findAllAttendance(
      employeeId ? +employeeId : undefined,
      startDate,
      endDate,
    );
  }

  @Get('today/:employeeId')
  findTodayAttendance(@Param('employeeId') employeeId: string) {
    return this.attendanceService.findTodayAttendance(+employeeId);
  }

  @Post('check-in')
  checkIn(@Body() body: { employeeId: number; type?: string }) {
    return this.attendanceService.checkIn(body.employeeId, body.type);
  }

  @Post('check-out')
  checkOut(@Body() body: { employeeId: number; type?: string }) {
    return this.attendanceService.checkOut(body.employeeId, body.type);
  }

  // Customer check-in
  @Get('check-ins')
  findAllCheckIns(
    @Query('customerId') customerId?: string,
    @Query('storeId') storeId?: string,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.findAllCheckIns(
      customerId ? +customerId : undefined,
      storeId ? +storeId : undefined,
      date,
    );
  }

  @Post('check-ins')
  createCheckIn(@Body() body: { customerId: number; storeId: number; appointmentId?: number; type?: string }) {
    return this.attendanceService.createCheckIn(body);
  }
}
