import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('categories')
  findAllCategories() {
    return this.servicesService.findAllCategories();
  }

  @Get('categories/:id')
  findCategory(@Param('id') id: string) {
    return this.servicesService.findAllCategories();
  }

  @Post('categories')
  createCategory(@Body() data: any) {
    return this.servicesService.createCategory(data);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.servicesService.updateCategory(+id, data);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.servicesService.deleteCategory(+id);
  }

  @Get()
  findAll(@Query('storeId') storeId?: string) {
    return this.servicesService.findAll(storeId ? +storeId : undefined);
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string, @Query('storeId') storeId?: string) {
    return this.servicesService.findByCategory(+categoryId, storeId ? +storeId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Post()
  create(@Body() data: any) {
    return this.servicesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.servicesService.update(+id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.servicesService.delete(+id);
  }
}
