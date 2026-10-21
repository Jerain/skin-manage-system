import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarePlansController } from './care-plans.controller';
import { CarePlansService } from './care-plans.service';
import { CarePlanReminderService } from './care-plan-reminder.service';
import { CarePlanRemindersController } from './care-plan-reminders.controller';
import { CarePlan } from '../../database/entities/care-plan.entity';
import { CarePlanItem } from '../../database/entities/care-plan-item.entity';
import { CarePlanReminder } from '../../database/entities/care-plan-reminder.entity';
import { Customer } from '../../database/entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarePlan, CarePlanItem, CarePlanReminder, Customer]),
  ],
  controllers: [CarePlansController, CarePlanRemindersController],
  providers: [CarePlansService, CarePlanReminderService],
  exports: [CarePlansService, CarePlanReminderService],
})
export class CarePlansModule {}
