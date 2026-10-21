import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MemberLevelsService } from './member-levels.service';

@Controller()
export class MemberLevelsController {
  constructor(private readonly memberLevelsService: MemberLevelsService) {}

  @Get('member-levels')
  getAllLevels() {
    return this.memberLevelsService.findAllLevels();
  }

  /** F004-8：新增会员等级 */
  @Post('member-levels')
  createLevel(@Body() data: any) {
    return this.memberLevelsService.createLevel(data);
  }

  /** F004-8：更新会员等级 */
  @Put('member-levels/:id')
  updateLevel(@Param('id') id: string, @Body() data: any) {
    return this.memberLevelsService.updateLevel(Number(id), data);
  }

  /** F004-8：删除会员等级 */
  @Delete('member-levels/:id')
  deleteLevel(@Param('id') id: string) {
    return this.memberLevelsService.deleteLevel(Number(id));
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
