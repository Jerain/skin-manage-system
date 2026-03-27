import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkinRecordsController } from './skin-records.controller';
import { SkinRecordsService } from './skin-records.service';
import { SkinRecord } from '../../database/entities/skin-record.entity';
import { SkinComparison } from '../../database/entities/skin-comparison.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkinRecord, SkinComparison]),
  ],
  controllers: [SkinRecordsController],
  providers: [SkinRecordsService],
  exports: [SkinRecordsService],
})
export class SkinRecordsModule {}
