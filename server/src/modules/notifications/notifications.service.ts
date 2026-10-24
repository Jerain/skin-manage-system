import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';

export interface CreateNotificationInput {
  customerId: number;
  type?: string;
  title: string;
  summary?: string;
  link?: string;
  refId?: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  /**
   * 落一条站内消息
   * 推送兜底通道：微信订阅消息发失败时也必须落库，保证用户能看到
   */
  async create(input: CreateNotificationInput): Promise<Notification> {
    const entity = this.repo.create({
      customerId: input.customerId,
      type: input.type || 'system',
      title: input.title,
      summary: input.summary || '',
      link: input.link || '',
      refId: input.refId ?? null,
      isRead: 0,
    });
    const saved = await this.repo.save(entity);
    this.logger.log(`站内消息已落库 #${saved.id} → 客户 ${input.customerId}（${input.type || 'system'}）`);
    return saved;
  }

  /** 客户消息列表（未读优先） */
  async findByCustomer(customerId: number, unreadOnly = false, limit = 50) {
    const where: any = { customerId };
    if (unreadOnly) where.isRead = 0;

    const list = await this.repo.find({
      where,
      order: { isRead: 'ASC', createdAt: 'DESC' },
      take: Math.min(limit, 200),
    });

    return list.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      summary: n.summary,
      link: n.link,
      refId: n.refId,
      isRead: n.isRead,
      readAt: n.readAt,
      createdAt: n.createdAt,
    }));
  }

  /** 未读数量（个人中心红点） */
  async countUnread(customerId: number): Promise<number> {
    return this.repo.count({ where: { customerId, isRead: 0 } });
  }

  /** 标记单条已读 */
  async markRead(id: number, customerId?: number): Promise<Notification> {
    const where: any = { id };
    if (customerId) where.customerId = customerId;

    const item = await this.repo.findOne({ where });
    if (!item) throw new NotFoundException('消息不存在');

    if (!item.isRead) {
      item.isRead = 1;
      item.readAt = new Date();
      await this.repo.save(item);
    }
    return item;
  }

  /** 全部标记已读 */
  async markAllRead(customerId: number): Promise<number> {
    const result = await this.repo.update(
      { customerId, isRead: 0 },
      { isRead: 1, readAt: new Date() },
    );
    return result.affected || 0;
  }
}
