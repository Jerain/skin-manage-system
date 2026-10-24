import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * 会员卡（BUG-103）
 * 列名与项目其他新表保持一致（camelCase，由实体属性名直接映射）
 */
@Entity('member_cards')
export class MemberCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  customerId: number;

  @Column({ length: 100, nullable: true })
  cardName: string;

  @Column({ length: 20, default: 'times' })
  cardType: string;

  @Column({ type: 'int', default: 0 })
  totalTimes: number;

  @Column({ type: 'int', default: 0 })
  usedTimes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'date', nullable: true })
  expiredAt: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
