import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Post()
  create(@Body() data: any) {
    return this.adminService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.adminService.update(+id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.adminService.delete(+id);
  }
}
