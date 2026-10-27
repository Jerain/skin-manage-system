import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { SubscriptionsController } from './subscriptions.controller';
import { NotificationsService } from './notifications.service';
import { WechatSubscribeService } from './wechat-subscribe.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController, SubscriptionsController],
  providers: [NotificationsService, WechatSubscribeService],
  exports: [NotificationsService, WechatSubscribeService],
})
export class NotificationsModule {}
