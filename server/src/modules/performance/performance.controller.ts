import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { PerformanceService } from './performance.service';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  createPerformance(@Body() data: any) {
    return this.performanceService.createPerformance(data);
  }

  @Get('technician/:id')
  getTechnicianPerformance(@Param('id') id: string, @Query('month') month?: string) {
    return this.performanceService.findByTechnician(Number(id), month);
  }

  @Get('technician/:id/realtime')
  getRealtimePerformance(@Param('id') id: string) {
    return this.performanceService.getRealtimePerformance(Number(id));
  }

  @Get('bonus-rules')
  getBonusRules(@Query('storeId') storeId?: string) {
    return this.performanceService.getBonusRules(storeId ? Number(storeId) : undefined);
  }

  @Get('bonus/:technicianId/:month')
  getTechnicianBonus(@Param('technicianId') technicianId: string, @Param('month') month: string) {
    return this.performanceService.calculateBonus(Number(technicianId), month);
  }
}
