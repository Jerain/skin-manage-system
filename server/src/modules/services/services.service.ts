import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceCategory } from '../../database/entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private categoryRepo: Repository<ServiceCategory>,
  ) {}

  async findAllCategories() {
    return this.categoryRepo.find({ where: { status: 1 }, order: { sortOrder: 'ASC' } });
  }

  async findAll(storeId?: number) {
    const where: any = { status: 1 };
    if (storeId) where.storeId = storeId;
    return this.serviceRepo.find({ 
      where, 
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      relations: ['store']
    });
  }

  async findByCategory(categoryId: number, storeId?: number) {
    const where: any = { categoryId, status: 1 };
    if (storeId) where.storeId = storeId;
    return this.serviceRepo.find({ where, order: { sortOrder: 'ASC' } });
  }

  async findOne(id: number) {
    const service = await this.serviceRepo.findOne({ 
      where: { id },
      relations: ['store']
    });
    if (!service) throw new NotFoundException('服务项目不存在');
    return service;
  }

  async create(data: Partial<Service>) {
    const service = this.serviceRepo.create(data);
    return this.serviceRepo.save(service);
  }

  async update(id: number, data: Partial<Service>) {
    await this.serviceRepo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.serviceRepo.update(id, { status: 0 });
    return { success: true };
  }

  // Category methods
  async createCategory(data: Partial<ServiceCategory>) {
    const category = this.categoryRepo.create(data);
    return this.categoryRepo.save(category);
  }

  async updateCategory(id: number, data: Partial<ServiceCategory>) {
    await this.categoryRepo.update(id, data);
    return this.categoryRepo.findOne({ where: { id } });
  }

  async deleteCategory(id: number) {
    await this.categoryRepo.update(id, { status: 0 });
    return { success: true };
  }
}
