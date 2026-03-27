import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Store } from './store.entity';
import { Employee } from './employee.entity';
import { Service } from './service.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Index()
  @Column({ name: 'store_id' })
  storeId: number;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Index()
  @Column({ name: 'employee_id' })
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'service_id' })
  serviceId: number;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Index()
  @Column({ name: 'appointment_date', type: 'date' })
  appointmentDate: Date;

  @Column({ name: 'appointment_time', type: 'time' })
  appointmentTime: string;

  @Column({ name: 'duration_hours', type: 'decimal', precision: 3, scale: 1, default: 1 })
  durationHours: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'cancel_reason', length: 255, nullable: true })
  cancelReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
