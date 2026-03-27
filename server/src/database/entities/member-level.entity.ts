import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('member_levels')
export class MemberLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  levelName: string;

  @Column({ type: 'varchar', length: 20 })
  levelCode: string;

  @Column({ type: 'int', default: 0 })
  threshold: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1 })
  discount: number;

  @Column({ type: 'int', default: 1 })
  pointsRate: number;

  @Column({ type: 'tinyint', default: 0 })
  priorityBooking: number;

  @Column({ type: 'tinyint', default: 0 })
  exclusiveTechnician: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
