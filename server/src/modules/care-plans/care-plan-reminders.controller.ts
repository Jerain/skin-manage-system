import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CarePlanReminderService } from './care-plan-reminder.service';

/**
 * F003-5：月度推送提醒接口
 */
@Controller('care-plan-reminders')
export class CarePlanRemindersController {
  constructor(private readonly reminderService: CarePlanReminderService) {}

  /** GET /api/care-plan-reminders/customer/:customerId */
  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.reminderService.findByCustomer(Number(customerId));
  }

  /** POST /api/care-plan-reminders/:id/read */
  @Post(':id/read')
  markRead(@Param('id') id: string) {
    return this.reminderService.markRead(Number(id));
  }

  /** POST /api/care-plan-reminders/generate  body: { period?, force? } */
  @Post('generate')
  generate(@Body() body: { period?: string; force?: boolean }) {
    if (body?.force) {
      return this.reminderService.tick(true);
    }
    return this.reminderService.generateMonthlyReminders(body?.period);
  }
}
