import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll(@Query('storeId') storeId?: string) {
    return this.employeesService.findAll(storeId ? +storeId : undefined);
  }

  @Get('store/:storeId')
  findByStore(@Param('storeId') storeId: string) {
    return this.employeesService.findByStore(+storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Post()
  create(@Body() data: any) {
    return this.employeesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.employeesService.update(+id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.employeesService.delete(+id);
  }
}
