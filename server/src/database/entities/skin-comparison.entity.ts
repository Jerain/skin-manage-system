import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('skin_comparisons')
@Index(['customerId'])
export class SkinComparison {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column({ nullable: true })
  beforeRecordId: number;

  @Column({ nullable: true })
  afterRecordId: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  comparisonImageUrl: string;

  @Column({ type: 'text', nullable: true })
  improvementHighlights: string;

  @Column({ type: 'tinyint', default: 0 })
  pushed: number;

  @Column({ type: 'datetime', nullable: true })
  pushTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}
