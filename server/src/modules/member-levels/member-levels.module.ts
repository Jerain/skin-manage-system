import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberLevelsController } from './member-levels.controller';
import { MemberLevelsService } from './member-levels.service';
import { MemberLevel } from '../../database/entities/member-level.entity';
import { CustomerLevel } from '../../database/entities/customer-level.entity';
import { GrowthRecord } from '../../database/entities/growth-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberLevel, CustomerLevel, GrowthRecord])],
  controllers: [MemberLevelsController],
  providers: [MemberLevelsService],
  exports: [MemberLevelsService],
})
export class MemberLevelsModule {}
