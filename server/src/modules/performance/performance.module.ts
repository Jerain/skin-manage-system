import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { PerformanceRecord } from '../../database/entities/performance-record.entity';
import { BonusRule } from '../../database/entities/bonus-rule.entity';
import { TechnicianBonus } from '../../database/entities/technician-bonus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PerformanceRecord, BonusRule, TechnicianBonus]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
