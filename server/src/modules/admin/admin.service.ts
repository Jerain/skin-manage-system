import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../../database/entities/attendance.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminUser)
    private adminRepo: Repository<AdminUser>,
  ) {}

  async findAll() {
    return this.adminRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('管理员不存在');
    return admin;
  }

  async findByUsername(username: string) {
    return this.adminRepo.findOne({ where: { username } });
  }

  async create(data: Partial<AdminUser>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const admin = this.adminRepo.create(data);
    return this.adminRepo.save(admin);
  }

  async update(id: number, data: Partial<AdminUser>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    await this.adminRepo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.adminRepo.delete(id);
    return { success: true };
  }

  async validateCredentials(username: string, password: string): Promise<AdminUser | null> {
    const admin = await this.findByUsername(username);
    if (!admin || admin.status === 0) return null;
    
    const isValid = await bcrypt.compare(password, admin.password);
    return isValid ? admin : null;
  }
}
