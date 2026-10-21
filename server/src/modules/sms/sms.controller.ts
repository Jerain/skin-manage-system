import { Controller, Post, Body } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  /** 发送短信验证码（BUG-105） */
  @Post('send')
  sendCode(@Body() body: { phone: string; scene?: string }) {
    return this.smsService.sendCode(body.phone);
  }

  /** 校验短信验证码 */
  @Post('verify')
  verifyCode(@Body() body: { phone: string; code: string }) {
    return this.smsService.verifyCode(body.phone, body.code);
  }
}
