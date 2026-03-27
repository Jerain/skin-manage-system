import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('care_plan_items')
@Index(['planId'])
export class CarePlanItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  planId: number;

  @Column({ nullable: true })
  serviceId: number;

  @Column({ type: 'int', nullable: true })
  plannedMonth: number;

  @Column({ type: 'date', nullable: true })
  suggestedDate: string;

  @Column({ type: 'date', nullable: true })
  actualDate: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
