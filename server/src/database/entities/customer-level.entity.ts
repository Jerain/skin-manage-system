import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('customer_levels')
@Index(['customerId'])
export class CustomerLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  customerId: number;

  @Column({ type: 'int', default: 1 })
  levelId: number;

  @Column({ type: 'int', default: 0 })
  growthValue: number;

  @Column({ type: 'int', default: 0 })
  totalPoints: number;

  @Column({ type: 'int', default: 0 })
  availablePoints: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
