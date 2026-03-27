import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('growth_records')
@Index(['customerId'])
export class GrowthRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column({ type: 'varchar', length: 20 })
  growthType: string;

  @Column({ type: 'int', default: 0 })
  growthValue: number;

  @Column({ nullable: true })
  relatedId: number;

  @CreateDateColumn()
  createdAt: Date;
}
