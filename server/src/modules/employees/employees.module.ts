import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { TechniciansController } from './technicians.controller';
import { Employee } from '../../database/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  controllers: [EmployeesController, TechniciansController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
