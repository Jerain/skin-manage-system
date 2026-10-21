import { Controller, Get, Query, Param } from '@nestjs/common';
import { EmployeesService } from '../employees/employees.service';

/**
 * BUG-102：技师列表接口
 * 需求文档中前端按 /api/technicians 调用，这里提供别名接口
 */
@Controller('technicians')
export class TechniciansController {
  constructor(private readonly employeesService: EmployeesService) {}

  /** GET /api/technicians?storeId=1 */
  @Get()
  findAll(@Query('storeId') storeId?: string) {
    return this.employeesService.findTechnicians(storeId ? +storeId : undefined);
  }

  /** GET /api/technicians/store/:storeId */
  @Get('store/:storeId')
  findByStore(@Param('storeId') storeId: string) {
    return this.employeesService.findTechnicians(+storeId);
  }

  /** GET /api/technicians/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }
}
