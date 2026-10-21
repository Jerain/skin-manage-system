import { Injectable, BadRequestException } from '@nestjs/common';
import { randomInt } from 'crypto';

interface SmsCodeEntry {
  code: string;
  expiresAt: number;
  used: boolean;
}

@Injectable()
export class SmsService {
  /** phone -> 验证码记录 */
  private codes: Map<string, SmsCodeEntry> = new Map();

  private readonly ttl = 5 * 60 * 1000; // 5 分钟有效期
  private readonly resendInterval = 60 * 1000; // 60 秒内不可重复发送

  /**
   * 发送短信验证码（BUG-105）
   * 生产环境应接入短信服务商网关（阿里云/腾讯云），此处生成验证码并记录
   */
  async sendCode(phone: string) {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      throw new BadRequestException('手机号格式不正确');
    }

    const existing = this.codes.get(phone);
    if (existing && !existing.used && Date.now() - (existing.expiresAt - this.ttl) < this.resendInterval) {
      throw new BadRequestException('验证码发送过于频繁，请稍后再试');
    }

    const code = randomInt(1000, 10000).toString();
    this.codes.set(phone, {
      code,
      expiresAt: Date.now() + this.ttl,
      used: false,
    });

    // TODO: 接入短信服务商后改为真实发送
    console.log(`[SMS] 验证码 ${code} -> ${phone}`);

    return {
      phone,
      expiresIn: this.ttl / 1000,
      // 开发环境返回验证码便于联调，生产环境须移除
      code,
    };
  }

  /** 校验验证码 */
  async verifyCode(phone: string, code: string) {
    const entry = this.codes.get(phone);
    if (!entry) return { valid: false, message: '验证码不存在或已失效' };
    if (entry.used) return { valid: false, message: '验证码已使用' };
    if (Date.now() > entry.expiresAt) {
      this.codes.delete(phone);
      return { valid: false, message: '验证码已过期' };
    }
    if (entry.code !== code) return { valid: false, message: '验证码错误' };

    entry.used = true;
    this.codes.set(phone, entry);
    return { valid: true, message: '验证成功' };
  }
}
