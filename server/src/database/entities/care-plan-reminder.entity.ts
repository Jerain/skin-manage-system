import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('care_plan_reminders')
@Index(['customerId'])
export class CarePlanReminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column({ nullable: true })
  carePlanId: number;

  /** 提醒的年月，格式 YYYY-MM */
  @Column({ type: 'varchar', length: 7 })
  period: string;

  @Column({ type: 'varchar', length: 50, default: 'monthly' })
  remindType: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  pushedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
