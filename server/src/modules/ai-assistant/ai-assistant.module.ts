import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { CustomersModule } from '../customers/customers.module';
import { StoresModule } from '../stores/stores.module';
import { ServicesModule } from '../services/services.module';
import { EmployeesModule } from '../employees/employees.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    HttpModule,
    CustomersModule,
    StoresModule,
    ServicesModule,
    EmployeesModule,
    AppointmentsModule,
    OrdersModule,
  ],
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
