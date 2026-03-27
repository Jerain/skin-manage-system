import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('technician_bonuses')
@Index(['technicianId'])
@Index(['month'])
export class TechnicianBonus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  technicianId: number;

  @Column({ nullable: true })
  storeId: number;

  @Column({ nullable: true })
  bonusRuleId: number;

  @Column({ type: 'varchar', length: 50 })
  bonusType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  bonusAmount: number;

  @Column({ type: 'varchar', length: 7, comment: '2026-03' })
  month: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;
}
