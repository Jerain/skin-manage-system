import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('performance_records')
@Index(['technicianId'])
@Index(['orderDate'])
export class PerformanceRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  technicianId: number;

  @Column({ nullable: true })
  orderId: number;

  @Column({ nullable: true })
  appointmentId: number;

  @Column({ nullable: true })
  serviceId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serviceName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  serviceAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commissionAmount: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  orderDate: string;

  @CreateDateColumn()
  createdAt: Date;
}
