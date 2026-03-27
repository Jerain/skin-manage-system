import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../database/entities/customer.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async findAll() {
    return this.customerRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('客户不存在');
    return customer;
  }

  async findByPhone(phone: string) {
    return this.customerRepo.findOne({ where: { phone } });
  }

  async findByFaceToken(faceToken: string) {
    return this.customerRepo.findOne({ where: { faceToken } });
  }

  async create(data: Partial<Customer>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const customer = this.customerRepo.create(data);
    return this.customerRepo.save(customer);
  }

  async update(id: number, data: Partial<Customer>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    await this.customerRepo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.customerRepo.delete(id);
    return { success: true };
  }

  async validatePassword(customer: Customer, password: string): Promise<boolean> {
    if (!customer.password) return false;
    return bcrypt.compare(password, customer.password);
  }

  async updateBalance(id: number, amount: number, type: 'add' | 'subtract') {
    const customer = await this.findOne(id);
    if (type === 'subtract' && customer.balance < amount) {
      throw new Error('余额不足');
    }
    await this.customerRepo.update(id, {
      balance: type === 'add' ? customer.balance + amount : customer.balance - amount,
    });
    return this.findOne(id);
  }

  async updatePoints(id: number, points: number, type: 'add' | 'subtract') {
    const customer = await this.findOne(id);
    await this.customerRepo.update(id, {
      points: type === 'add' ? customer.points + points : customer.points - points,
    });
    return this.findOne(id);
  }
}
