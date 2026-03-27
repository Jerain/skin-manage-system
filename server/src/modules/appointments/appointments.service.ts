import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, And } from 'typeorm';
import { Appointment } from '../../database/entities/appointment.entity';
import { CustomersService } from '../customers/customers.service';
import { StoresService } from '../stores/stores.service';
import { EmployeesService } from '../employees/employees.service';
import { ServicesService } from '../services/services.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    private customersService: CustomersService,
    private storesService: StoresService,
    private employeesService: EmployeesService,
    private servicesService: ServicesService,
  ) {}

  async findAll(filters?: { storeId?: number; customerId?: number; employeeId?: number; status?: string }) {
    const where: any = {};
    if (filters?.storeId) where.storeId = filters.storeId;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;
    
    return this.appointmentRepo.find({
      where,
      relations: ['customer', 'store', 'employee', 'service'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });
  }

  async findByDate(date: string, storeId?: number) {
    const where: any = { appointmentDate: date };
    if (storeId) where.storeId = storeId;
    
    return this.appointmentRepo.find({
      where,
      relations: ['customer', 'store', 'employee', 'service'],
      order: { appointmentTime: 'ASC' },
    });
  }

  async findToday(storeId?: number) {
    const today = new Date().toISOString().split('T')[0];
    return this.findByDate(today, storeId);
  }

  async findOne(id: number) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['customer', 'store', 'employee', 'service'],
    });
    if (!appointment) throw new NotFoundException('预约不存在');
    return appointment;
  }

  async create(data: {
    customerId: number;
    storeId: number;
    employeeId: number;
    serviceId: number;
    appointmentDate: string;
    appointmentTime: string;
    durationHours?: number;
    notes?: string;
  }) {
    // Verify all entities exist
    await this.customersService.findOne(data.customerId);
    await this.storesService.findOne(data.storeId);
    await this.employeesService.findOne(data.employeeId);
    await this.servicesService.findOne(data.serviceId);

    const durationHours = data.durationHours || 1;

    // Conflict detection
    const hasConflict = await this.checkConflict(
      data.employeeId,
      data.appointmentDate,
      data.appointmentTime,
      durationHours,
    );

    if (hasConflict) {
      throw new BadRequestException('该技师此时段已被预约，请选择其他时间');
    }

    const appointment = this.appointmentRepo.create({
      ...data,
      durationHours,
      status: 'pending',
    });

    return this.appointmentRepo.save(appointment);
  }

  async checkConflict(
    employeeId: number,
    date: string,
    time: string,
    durationHours: number,
    excludeId?: number,
  ): Promise<boolean> {
    console.log(`[ConflictCheck] employeeId=${employeeId}, date=${date}, time=${time}, durationHours=${durationHours}`);
    
    // Parse time to minutes for comparison
    const [hours, minutes] = time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationHours * 60;
    
    console.log(`[ConflictCheck] startMinutes=${startMinutes}, endMinutes=${endMinutes}`);

    // Find all appointments for this employee on this date (exclude cancelled)
    // Use string comparison to avoid timezone issues
    const dateStr = date.split('T')[0]; // Ensure we use just the date part
    const allAppointments = await this.appointmentRepo
      .createQueryBuilder('apt')
      .where('apt.employeeId = :employeeId', { employeeId })
      .andWhere('DATE(apt.appointmentDate) = :dateStr', { dateStr })
      .getMany();
    console.log(`[ConflictCheck] found ${allAppointments.length} appointments (dateStr=${dateStr})`);
    const appointments = allAppointments.filter(apt => apt.status !== 'cancelled');

    for (const apt of appointments) {
      if (excludeId && apt.id === excludeId) continue;

      // Handle both "14:00" and "14:00:00" formats
      const aptTimeStr = apt.appointmentTime.split(':').slice(0,2).join(':');
      const [aptHours, aptMinutes] = aptTimeStr.split(':').map(Number);
      const aptStartMinutes = aptHours * 60 + aptMinutes;
      const aptEndMinutes = aptStartMinutes + Number(apt.durationHours) * 60;

      // Check if times overlap
      if (startMinutes < aptEndMinutes && endMinutes > aptStartMinutes) {
        return true;
      }
    }

    return false;
  }

  async getAvailableTimes(employeeId: number, date: string, serviceDuration: number = 60) {
    const durationHours = serviceDuration / 60;
    
    // Get all existing appointments for this employee on this date
    const appointments = await this.appointmentRepo.find({
      where: {
        employeeId,
        appointmentDate: new Date(date),
        status: 'pending',
      },
      order: { appointmentTime: 'ASC' },
    });

    // Generate available time slots (09:00 - 21:00)
    const availableSlots: string[] = [];
    const startHour = 9;
    const endHour = 21;

    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const hasConflict = await this.checkConflict(employeeId, date, time, durationHours);
      
      if (!hasConflict) {
        availableSlots.push(time);
      }
    }

    return availableSlots;
  }

  async confirm(id: number) {
    await this.appointmentRepo.update(id, { status: 'confirmed' });
    return this.findOne(id);
  }

  async complete(id: number) {
    await this.appointmentRepo.update(id, { status: 'completed' });
    return this.findOne(id);
  }

  async cancel(id: number, reason?: string) {
    await this.appointmentRepo.update(id, { 
      status: 'cancelled',
      cancelReason: reason || '客户取消',
    });
    return this.findOne(id);
  }

  async reject(id: number, reason: string) {
    await this.appointmentRepo.update(id, { 
      status: 'rejected',
      cancelReason: reason,
    });
    return this.findOne(id);
  }
}
