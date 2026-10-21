import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SkinRecordsService } from './skin-records.service';

/**
 * F001-4 AI 对比图生成
 * POST /api/skin-comparisons 生成对比图
 * GET  /api/skin-comparisons/:customerId 获取客户对比图历史
 */
@Controller('skin-comparisons')
export class SkinComparisonsController {
  constructor(private readonly skinRecordsService: SkinRecordsService) {}

  /**
   * POST /api/skin-comparisons
   * body: { customerId, beforeRecordId?, afterRecordId?, push? }
   */
  @Post()
  async generate(@Body() data: any) {
    return this.skinRecordsService.generateComparison(data);
  }

  /**
   * GET /api/skin-comparisons/:customerId
   * 获取客户的历史对比图列表
   */
  @Get(':customerId')
  async findByCustomer(@Param('customerId') customerId: string) {
    return this.skinRecordsService.findComparisonsByCustomer(Number(customerId));
  }

  /**
   * GET /api/skin-comparisons/detail/:id
   * 获取单条对比图详情
   */
  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    return this.skinRecordsService.findComparisonById(Number(id));
  }

  /**
   * POST /api/skin-comparisons/:id/push
   * 推送对比图给客户
   */
  @Post(':id/push')
  async push(@Param('id') id: string) {
    return this.skinRecordsService.pushComparison(Number(id));
  }
}
