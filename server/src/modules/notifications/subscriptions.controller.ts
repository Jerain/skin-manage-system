import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { WechatSubscribeService } from './wechat-subscribe.service';
import { NotificationsService } from './notifications.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly wechatService: WechatSubscribeService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /** 服务端是否已具备微信下发条件（前端据此决定是否显示授权按钮） */
  @Get('config')
  config() {
    return {
      configured: this.wechatService.isConfigured(),
      templateId: process.env.WECHAT_SUBSCRIBE_TEMPLATE_ID || '',
    };
  }

  /**
   * 小程序 code 换 openid，并绑定到客户
   * 前端：uni.login() 拿到 code → 调本接口
   */
  @Post('wechat-login')
  async wechatLogin(@Body() body: { code: string; customerId: number }) {
    const result = await this.wechatService.code2Session(body.code);
    if (!result.openid) {
      return { ok: false, message: result.errMsg || 'code 换取 openid 失败' };
    }
    const ok = await this.wechatService.bindOpenid(Number(body.customerId), result.openid);
    return { ok, openid: result.openid };
  }

  /**
   * 记录一次性订阅授权
   * 前端在用户点击「订阅消息」授权后调用
   */
  @Post('grant')
  async grant(@Body() body: { customerId: number; templateId?: string; count?: number }) {
    const templateId = body.templateId || process.env.WECHAT_SUBSCRIBE_TEMPLATE_ID || '';
    return this.wechatService.recordGrant(
      Number(body.customerId),
      templateId,
      body.count ? Number(body.count) : 1,
    );
  }
}
