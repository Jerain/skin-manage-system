import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { SkinRecordsService } from './skin-records.service';

@Controller('skin-records')
export class SkinRecordsController {
  constructor(private readonly skinRecordsService: SkinRecordsService) {}

  @Post()
  create(@Body() data: any) {
    return this.skinRecordsService.create(data);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.skinRecordsService.findByCustomer(Number(customerId));
  }

  @Post('comparisons')
  createComparison(@Body() data: any) {
    return this.skinRecordsService.createComparison(data);
  }

  @Get('comparisons/:customerId')
  findComparisons(@Param('customerId') customerId: string) {
    return this.skinRecordsService.findComparisonsByCustomer(Number(customerId));
  }
}
