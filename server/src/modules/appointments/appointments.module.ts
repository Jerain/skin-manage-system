import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from '../../database/entities/appointment.entity';
import { CustomersModule } from '../customers/customers.module';
import { StoresModule } from '../stores/stores.module';
import { EmployeesModule } from '../employees/employees.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    CustomersModule,
    StoresModule,
    EmployeesModule,
    ServicesModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
