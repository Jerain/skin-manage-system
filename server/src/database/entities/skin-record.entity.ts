import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('skin_records')
export class SkinRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  recordDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  skinType: string;

  @Column({ type: 'text', nullable: true })
  skinIssues: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photoUrl: string;

  @Column({ type: 'json', nullable: true })
  aiAnalysis: any;

  @Column({ nullable: true })
  technicianId: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
