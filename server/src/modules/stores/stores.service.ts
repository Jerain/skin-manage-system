import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../database/entities/store.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storeRepo: Repository<Store>,
  ) {}

  async findAll() {
    return this.storeRepo.find({ where: { status: 1 }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const store = await this.storeRepo.findOne({ where: { id } });
    if (!store) throw new NotFoundException('门店不存在');
    return store;
  }

  async create(data: Partial<Store>) {
    const store = this.storeRepo.create(data);
    return this.storeRepo.save(store);
  }

  async update(id: number, data: Partial<Store>) {
    await this.storeRepo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.storeRepo.update(id, { status: 0 });
    return { success: true };
  }
}
