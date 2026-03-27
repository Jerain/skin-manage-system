import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Index()
  @Column({ length: 20 })
  phone: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @Column({ nullable: true })
  password: string;

  @Column({ name: 'face_token', nullable: true })
  faceToken: string;

  @Column({ name: 'skin_type', length: 50, nullable: true })
  skinType: string;

  @Column({ name: 'allergy_info', type: 'text', nullable: true })
  allergyInfo: string;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 1 })
  level: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
