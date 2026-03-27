import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Store } from './store.entity';
import { Employee } from './employee.entity';
import { Service } from './service.entity';
import { Appointment } from './appointment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'order_no', length: 50 })
  orderNo: string;

  @Index()
  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: number;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Index()
  @Column({ name: 'store_id' })
  storeId: number;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ name: 'service_id' })
  serviceId: number;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'employee_id', nullable: true })
  employeeId: number;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualAmount: number;

  @Column({ name: 'pay_type', length: 20, nullable: true })
  payType: string;

  @Column({ name: 'pay_status', default: 'unpaid' })
  payStatus: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'pay_time', nullable: true })
  payTime: Date;

  @Column({ name: 'confirm_time', nullable: true })
  confirmTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
