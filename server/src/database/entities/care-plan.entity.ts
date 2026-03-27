import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('care_plans')
@Index(['customerId'])
export class CarePlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column({ type: 'date', nullable: true })
  planStartDate: string;

  @Column({ type: 'date', nullable: true })
  planEndDate: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  skinType: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  season: string;

  @Column({ type: 'json', nullable: true })
  planItems: any;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
