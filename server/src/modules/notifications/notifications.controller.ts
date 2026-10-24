import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /** 消息中心列表 */
  @Get()
  findAll(
    @Query('customerId') customerId: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.findByCustomer(
      Number(customerId),
      unreadOnly === 'true' || unreadOnly === '1',
      limit ? Number(limit) : 50,
    );
  }

  /** 未读数量（个人中心红点） */
  @Get('unread-count')
  async unreadCount(@Query('customerId') customerId: string) {
    return { count: await this.notificationsService.countUnread(Number(customerId)) };
  }

  /** 标记单条已读 */
  @Post(':id/read')
  markRead(@Param('id') id: string, @Body() body: { customerId?: number }) {
    return this.notificationsService.markRead(Number(id), body?.customerId);
  }

  /** 全部标记已读 */
  @Post('read-all')
  async markAllRead(@Body() body: { customerId: number }) {
    const affected = await this.notificationsService.markAllRead(Number(body.customerId));
    return { affected };
  }
}
