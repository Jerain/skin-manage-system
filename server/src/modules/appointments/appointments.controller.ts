import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll(
    @Query('storeId') storeId?: string,
    @Query('customerId') customerId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.appointmentsService.findAll({
      storeId: storeId ? +storeId : undefined,
      customerId: customerId ? +customerId : undefined,
      employeeId: employeeId ? +employeeId : undefined,
      status,
    });
  }

  @Get('today')
  findToday(@Query('storeId') storeId?: string) {
    return this.appointmentsService.findToday(storeId ? +storeId : undefined);
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string, @Query('storeId') storeId?: string) {
    return this.appointmentsService.findByDate(date, storeId ? +storeId : undefined);
  }

  @Get('available-times')
  getAvailableTimes(
    @Query('employeeId') employeeId: string,
    @Query('date') date: string,
    @Query('duration') duration?: string,
  ) {
    return this.appointmentsService.getAvailableTimes(
      +employeeId,
      date,
      duration ? +duration : 60,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Post()
  create(@Body() data: any) {
    return this.appointmentsService.create(data);
  }

  @Put(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.appointmentsService.confirm(+id);
  }

  @Put(':id/complete')
  complete(@Param('id') id: string) {
    return this.appointmentsService.complete(+id);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.appointmentsService.cancel(+id, reason);
  }

  @Put(':id/reject')
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.appointmentsService.reject(+id, reason);
  }
}
