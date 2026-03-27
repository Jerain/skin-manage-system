import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('bonus_rules')
@Index(['storeId'])
export class BonusRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  storeId: number;

  @Column({ type: 'varchar', length: 100 })
  ruleName: string;

  @Column({ type: 'varchar', length: 50, comment: '基础提成/业绩奖励/好评奖励/满勤奖' })
  ruleType: string;

  @Column({ type: 'varchar', length: 50, comment: 'service_amount/monthly_sales/praise_rate/attendance' })
  conditionType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  conditionValue: number;

  @Column({ type: 'varchar', length: 20, comment: 'percentage/fixed' })
  bonusType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  bonusAmount: number;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
