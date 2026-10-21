import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { SkinRecordsController } from './skin-records.controller';
import { SkinComparisonsController } from './skin-comparisons.controller';
import { SkinRecordsService } from './skin-records.service';
import { AiComparisonService } from './ai-comparison.service';
import { SkinRecord } from '../../database/entities/skin-record.entity';
import { SkinComparison } from '../../database/entities/skin-comparison.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkinRecord, SkinComparison]),
    HttpModule,
  ],
  controllers: [SkinRecordsController, SkinComparisonsController],
  providers: [SkinRecordsService, AiComparisonService],
  exports: [SkinRecordsService, AiComparisonService],
})
export class SkinRecordsModule {}
