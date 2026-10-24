import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 站内消息（推送兜底通道）
 *
 * 微信一次性订阅消息覆盖率不稳定（用户未授权 / 模板被拒 / 长期未回访），
 * 所以对比图、护理计划提醒等推送都必须同时落一条站内消息，
 * 客户端「消息中心」拉取，未读红点引导进入详情页。
 *
 * 规格见 f001-comparison-spec.md §5.1 通道二
 */
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  /** 接收人（客户） */
  @Index()
  @Column()
  customerId: number;

  /**
   * 消息类型：
   * skin_comparison  肤质对比报告
   * care_plan        护理计划提醒
   * appointment      预约提醒
   * promotion        活动通知
   */
  @Column({ length: 50, default: 'system' })
  type: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  /** 客户端跳转路径，如 /pages/skin-comparison/index */
  @Column({ length: 200, nullable: true })
  link: string;

  /** 关联业务 ID（如 skin_comparisons.id） */
  @Column({ nullable: true })
  refId: number;

  @Index()
  @Column({ default: 0 })
  isRead: number;

  @Column({ type: 'datetime', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
