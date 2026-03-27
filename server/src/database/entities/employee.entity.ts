import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './store.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'store_id' })
  storeId: number;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ length: 50 })
  name: string;

  @Index()
  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @Column({ length: 20 })
  role: string;

  @Column({ length: 50, nullable: true })
  position: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @Column({ name: 'face_token', nullable: true })
  faceToken: string;

  @Column({ type: 'json', nullable: true })
  skills: number[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5 })
  rating: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
