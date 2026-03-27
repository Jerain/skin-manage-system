import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(+id);
  }

  @Post()
  create(@Body() data: any) {
    return this.storesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.storesService.update(+id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.storesService.delete(+id);
  }
}
