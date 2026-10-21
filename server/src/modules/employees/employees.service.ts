import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

  /**
   * 技师列表（BUG-102）
   * 与员工列表同源，附加技师维度字段：剩余可约次数、评分、擅长技能
   */
  async findTechnicians(storeId?: number, role?: string) {
    const baseWhere: any = { status: 1 };
    if (storeId) baseWhere.storeId = storeId;

    // 指定角色时直接过滤；未指定时默认只取技师类角色
    const roles = role
      ? [role]
      : ['technician', 'therapist', 'esthetician', 'beautician'];

    let employees = await this.employeeRepo.find({
      where: { ...baseWhere, role: In(roles) },
      order: { rating: 'DESC', createdAt: 'DESC' },
    });

    // 兜底：库里若未按角色分类，则返回全部在职员工
    if (!employees.length && !role) {
      employees = await this.employeeRepo.find({
        where: baseWhere,
        order: { rating: 'DESC', createdAt: 'DESC' },
      });
    }

    return employees.map((e) => ({
      id: e.id,
      storeId: e.storeId,
      name: e.name,
      phone: e.phone,
      avatar: e.avatar,
      role: e.role,
      position: e.position,
      skills: e.skills,
      rating: e.rating,
      isTechnician: true,
    }));
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
