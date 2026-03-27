import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarePlansController } from './care-plans.controller';
import { CarePlansService } from './care-plans.service';
import { CarePlan } from '../../database/entities/care-plan.entity';
import { CarePlanItem } from '../../database/entities/care-plan-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarePlan, CarePlanItem])],
  controllers: [CarePlansController],
  providers: [CarePlansService],
  exports: [CarePlansService],
})
export class CarePlansModule {}
