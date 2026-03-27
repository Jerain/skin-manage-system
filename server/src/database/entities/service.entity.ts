import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './store.entity';

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, nullable: true })
  icon: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'store_id', nullable: true })
  storeId: number;

  @ManyToOne(() => Store, { nullable: true })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  duration: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  effects: string;

  @Column({ type: 'text', nullable: true })
  precautions: string;

  @Column({ type: 'text', nullable: true })
  images: string;

  @Column({ name: 'is_featured', default: 0 })
  isFeatured: number;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
