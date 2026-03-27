import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query('customerId') customerId?: string,
    @Query('storeId') storeId?: string,
    @Query('status') status?: string,
    @Query('payStatus') payStatus?: string,
  ) {
    return this.ordersService.findAll({
      customerId: customerId ? +customerId : undefined,
      storeId: storeId ? +storeId : undefined,
      status,
      payStatus,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Get('no/:orderNo')
  findByOrderNo(@Param('orderNo') orderNo: string) {
    return this.ordersService.findByOrderNo(orderNo);
  }

  @Post()
  create(@Body() data: any) {
    return this.ordersService.create(data);
  }

  @Post(':id/pay')
  pay(@Param('id') id: string, @Body('payType') payType: string) {
    return this.ordersService.pay(+id, payType);
  }

  @Put(':id/complete')
  complete(@Param('id') id: string) {
    return this.ordersService.complete(+id);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(+id);
  }

  @Put(':id/refund')
  refund(@Param('id') id: string) {
    return this.ordersService.refund(+id);
  }
}
