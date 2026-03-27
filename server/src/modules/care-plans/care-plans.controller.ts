import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CarePlansService } from './care-plans.service';

@Controller('care-plans')
export class CarePlansController {
  constructor(private readonly carePlansService: CarePlansService) {}

  @Post()
  create(@Body() data: any) {
    return this.carePlansService.create(data);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.carePlansService.findByCustomer(Number(customerId));
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.carePlansService.findById(Number(id));
  }
}
