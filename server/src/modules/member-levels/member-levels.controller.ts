import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { MemberLevelsService } from './member-levels.service';

@Controller()
export class MemberLevelsController {
  constructor(private readonly memberLevelsService: MemberLevelsService) {}

  @Get('member-levels')
  getAllLevels() {
    return this.memberLevelsService.findAllLevels();
  }

  @Get('customer-level/:customerId')
  getCustomerLevel(@Param('customerId') customerId: string) {
    return this.memberLevelsService.getCustomerLevel(Number(customerId));
  }

  @Post('growth-records')
  addGrowth(@Body() data: { customerId: number; growthType: string; growthValue: number; relatedId?: number }) {
    return this.memberLevelsService.addGrowth(data.customerId, data.growthType, data.growthValue, data.relatedId);
  }

  @Get('growth-records/:customerId')
  getGrowthRecords(@Param('customerId') customerId: string) {
    return this.memberLevelsService.getGrowthRecords(Number(customerId));
  }

  @Post('customer-level/:customerId/upgrade')
  checkUpgrade(@Param('customerId') customerId: string) {
    return this.memberLevelsService.checkUpgrade(Number(customerId));
  }
}
