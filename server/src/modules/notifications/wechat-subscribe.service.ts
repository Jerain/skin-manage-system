import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';

/**
 * 微信小程序一次性订阅消息下发
 *
 * 规格：f001-comparison-spec.md §5.1 通道一
 *
 * 关键约束：
 *  - 一次性订阅：一次授权只能推 1 条，所以授权时机必须放在「护理完成确认页」
 *  - 模板 id 需在小程序后台申请（模板名 skin_comparison_ready），
 *    申请动作在微信公众平台完成，代码侧只读取 env 里的模板 id
 *  - 未配置 appid/secret/模板 id 时必须优雅降级（返回未发送），不能抛错阻断主流程
 *  - 无论微信通道成功与否，站内消息都必须落库（兜底通道）
 */

const WX_API_BASE = 'https://api.weixin.qq.com/cgi-bin';

export interface SubscribeGrant {
  customerId: number;
  templateId: string;
  /** 授权剩余条数（一次性订阅，每次授权 +1） */
  remaining: number;
}

@Injectable()
export class WechatSubscribeService {
  private readonly logger = new Logger(WechatSubscribeService.name);

  private readonly appId = (process.env.WECHAT_APPID || '').trim();
  private readonly appSecret = (process.env.WECHAT_APP_SECRET || '').trim();
  private readonly templateId = (process.env.WECHAT_SUBSCRIBE_TEMPLATE_ID || '').trim();
  private readonly apiBase = process.env.WECHAT_API_BASE || WX_API_BASE;

  private accessToken: { value: string; expiresAt: number } | null = null;

  /** customerId -> 已授权的模板与剩余条数 */
  private grants = new Map<number, Map<string, number>>();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  /** 是否具备下发条件 */
  isConfigured(): boolean {
    return !!(this.appId && this.appSecret && this.templateId);
  }

  /**
   * 记录客户端上报的一次订阅授权
   * 客户端在用户点击授权后调用本接口，把 templateId 与授权条数告诉服务端
   */
  async recordGrant(
    customerId: number,
    templateId: string,
    count = 1,
  ): Promise<{ ok: boolean; message: string }> {
    if (!templateId) {
      return { ok: false, message: '缺少 templateId' };
    }
    if (!this.grants.has(customerId)) {
      this.grants.set(customerId, new Map());
    }
    const map = this.grants.get(customerId)!;
    map.set(templateId, (map.get(templateId) || 0) + count);
    this.logger.log(`客户 ${customerId} 订阅授权 +${count} 条（模板 ${templateId}）`);
    return { ok: true, message: '已记录订阅授权' };
  }

  /** 查询客户是否还有可用授权 */
  hasGrant(customerId: number, templateId?: string): boolean {
    const map = this.grants.get(customerId);
    if (!map) return false;
    const tpl = templateId || this.templateId;
    return (map.get(tpl) || 0) > 0;
  }

  /** 消费一次授权（一次性订阅，推一条扣一条） */
  private consumeGrant(customerId: number, templateId: string): boolean {
    const map = this.grants.get(customerId);
    if (!map) return false;
    const left = map.get(templateId) || 0;
    if (left <= 0) return false;
    map.set(templateId, left - 1);
    return true;
  }

  /**
   * 获取 access_token（带内存缓存，微信 token 有效期 7200s）
   */
  private async getAccessToken(): Promise<string | null> {
    if (!this.appId || !this.appSecret) return null;

    const now = Date.now();
    if (this.accessToken && this.accessToken.expiresAt > now + 60_000) {
      return this.accessToken.value;
    }

    try {
      const res: any = await axios.get(
        `${this.apiBase}/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`,
        { timeout: 15000 },
      );
      const token = res?.data?.access_token;
      if (!token) {
        this.logger.warn(`获取 access_token 失败: ${res?.data?.errmsg || '未知错误'}`);
        return null;
      }
      this.accessToken = {
        value: token,
        expiresAt: now + (res?.data?.expires_in || 7200) * 1000,
      };
      return token;
    } catch (e: any) {
      this.logger.error(`获取 access_token 异常: ${e.message}`);
      return null;
    }
  }

  /**
   * 小程序 code 换 openid（code2session）
   * 未配置 appid/secret 时返回 { openid: null, errMsg }
   */
  async code2Session(code: string): Promise<{ openid: string | null; errMsg?: string }> {
    if (!this.appId || !this.appSecret) {
      return { openid: null, errMsg: '未配置 WECHAT_APPID / WECHAT_APP_SECRET' };
    }
    if (!code) {
      return { openid: null, errMsg: '缺少 code' };
    }
    try {
      const res: any = await axios.get(
        `${this.apiBase}/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`,
        { timeout: 15000 },
      );
      if (res?.data?.errcode || !res?.data?.openid) {
        const errMsg = res?.data?.errmsg || 'jscode2session 返回异常';
        this.logger.warn(`code 换 openid 失败: ${errMsg}`);
        return { openid: null, errMsg };
      }
      return { openid: res.data.openid };
    } catch (e: any) {
      const detail = e?.response?.data?.errmsg || e.message;
      this.logger.error(`code 换 openid 异常: ${detail}`);
      return { openid: null, errMsg: detail };
    }
  }

  /**
   * 把 openid 绑定到客户记录
   */
  async bindOpenid(customerId: number, openid: string): Promise<boolean> {
    try {
      await this.notificationRepo.manager.query(
        `UPDATE customers SET openid = ? WHERE id = ?`,
        [openid, customerId],
      );
      this.logger.log(`客户 ${customerId} 已绑定微信 openid`);
      return true;
    } catch (e: any) {
      this.logger.error(`绑定 openid 失败: ${e.message}`);
      return false;
    }
  }

  /**
   * 下发一次性订阅消息
   * 未配置 / 无授权 / 接口失败时返回 { sent: false, reason }，绝不抛错
   */
  async sendSkinComparisonReady(params: {
    customerId: number;
    openId: string;
    serviceName?: string;
    highlight?: string;
    link?: string;
  }): Promise<{ sent: boolean; reason: string; errcode?: number }> {
    if (!this.isConfigured()) {
      return { sent: false, reason: '未配置 WECHAT_APPID / WECHAT_APP_SECRET / WECHAT_SUBSCRIBE_TEMPLATE_ID' };
    }
    if (!params.openId) {
      return { sent: false, reason: '缺少用户 openid' };
    }
    if (!this.consumeGrant(params.customerId, this.templateId)) {
      return { sent: false, reason: '用户未授权一次性订阅（或授权已用完）' };
    }

    const token = await this.getAccessToken();
    if (!token) {
      return { sent: false, reason: '获取 access_token 失败' };
    }

    const serviceName = params.serviceName || '皮肤护理';
    const highlight = (params.highlight || '').slice(0, 20);

    try {
      const res: any = await axios.post(
        `${this.apiBase}/message/subscribe/send?access_token=${token}`,
        {
          touser: params.openId,
          template_id: this.templateId,
          page: params.link || 'pages/skin-comparison/index',
          miniprogram_state: process.env.WECHAT_MINIPROGRAM_STATE || 'formal',
          data: {
            thing1: { value: serviceName.slice(0, 20) },
            thing2: { value: highlight || '皮肤状态对比图已生成' },
            thing3: { value: '您的护理效果已生成' },
          },
        },
        { timeout: 15000 },
      );

      if (res?.data?.errcode) {
        this.logger.warn(
          `订阅消息下发失败 errcode=${res.data.errcode} errmsg=${res.data.errmsg || ''}`,
        );
        return { sent: false, reason: res.data.errmsg || '微信接口返回错误', errcode: res.data.errcode };
      }

      this.logger.log(`订阅消息已下发 → 客户 ${params.customerId}`);
      return { sent: true, reason: '已下发' };
    } catch (e: any) {
      const detail = e?.response?.data?.errmsg || e.message;
      this.logger.error(`订阅消息下发异常: ${detail}`);
      return { sent: false, reason: detail };
    }
  }
}
