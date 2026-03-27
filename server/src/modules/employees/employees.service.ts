import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../database/entities/employee.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  async findAll(storeId?: number) {
    const where = storeId ? { storeId, status: 1 } : { status: 1 };
    return this.employeeRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findByStore(storeId: number) {
    return this.employeeRepo.find({ 
      where: { storeId, status: 1 },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number) {
    const employee = await this.employeeRepo.findOne({ where: { id } });
    if (!employee) throw new NotFoundException('员工不存在');
    return employee;
  }

  async findByPhone(phone: string) {
    return this.employeeRepo.findOne({ where: { phone } });
  }

  async findByFaceToken(faceToken: string) {
    return this.employeeRepo.findOne({ where: { faceToken } });
  }

  async create(data: Partial<Employee>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const employee = this.employeeRepo.create(data);
    return this.employeeRepo.save(employee);
  }

  async update(id: number, data: Partial<Employee>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    await this.employeeRepo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.employeeRepo.update(id, { status: 0 });
    return { success: true };
  }

  async validatePassword(employee: Employee, password: string): Promise<boolean> {
    if (!employee.password) return false;
    return bcrypt.compare(password, employee.password);
  }
}
