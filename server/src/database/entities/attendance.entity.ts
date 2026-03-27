import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'employee_id' })
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Index()
  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'check_in', nullable: true })
  checkIn: Date;

  @Column({ name: 'check_out', nullable: true })
  checkOut: Date;

  @Column({ name: 'check_in_type', length: 20, nullable: true })
  checkInType: string;

  @Column({ name: 'check_out_type', length: 20, nullable: true })
  checkOutType: string;

  @Column({ default: 'normal' })
  status: string;

  @Column({ length: 255, nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('check_ins')
export class CheckIn {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'customer_id' })
  customerId: number;

  @Index()
  @Column({ name: 'store_id' })
  storeId: number;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: number;

  @Column({ name: 'check_in_time' })
  checkInTime: Date;

  @Column({ name: 'check_in_type', default: 'manual' })
  checkInType: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  username: string;

  @Column()
  password: string;

  @Column({ length: 50, nullable: true })
  name: string;

  @Column({ default: 'admin' })
  role: string;

  @Column({ name: 'store_id', nullable: true })
  storeId: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
