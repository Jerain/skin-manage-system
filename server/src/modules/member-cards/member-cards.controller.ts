import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MemberCardsService } from './member-cards.service';

@Controller('member-cards')
export class MemberCardsController {
  constructor(private readonly memberCardsService: MemberCardsService) {}

  /** 会员卡列表（BUG-103） */
  @Get()
  findAll(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    return this.memberCardsService.findAll(
      customerId ? +customerId : undefined,
      status,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberCardsService.findOne(+id);
  }

  @Post()
  create(@Body() data: any) {
    return this.memberCardsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.memberCardsService.update(+id, data);
  }

  @Put(':id/use')
  useTimes(@Param('id') id: string, @Body() body: { times?: number }) {
    return this.memberCardsService.useTimes(+id, body.times || 1);
  }

  @Put(':id/deduct')
  deductBalance(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.memberCardsService.deductBalance(+id, body.amount);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberCardsService.remove(+id);
  }
}
