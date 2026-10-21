import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('member_cards')
export class MemberCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({ name: 'card_name', length: 100, nullable: true })
  cardName: string;

  @Column({ name: 'card_type', length: 20, default: 'times' })
  cardType: string;

  @Column({ name: 'total_times', type: 'int', default: 0 })
  totalTimes: number;

  @Column({ name: 'used_times', type: 'int', default: 0 })
  usedTimes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ name: 'expired_at', type: 'date', nullable: true })
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
