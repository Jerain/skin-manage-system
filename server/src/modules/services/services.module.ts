import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service, ServiceCategory } from '../../database/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceCategory])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
