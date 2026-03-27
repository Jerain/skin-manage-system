import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkinRecord } from '../../database/entities/skin-record.entity';
import { SkinComparison } from '../../database/entities/skin-comparison.entity';

@Injectable()
export class SkinRecordsService {
  constructor(
    @InjectRepository(SkinRecord)
    private skinRecordRepo: Repository<SkinRecord>,
    @InjectRepository(SkinComparison)
    private skinComparisonRepo: Repository<SkinComparison>,
  ) {}

  // 创建肤质记录
  async create(data: {
    customerId: number;
    skinType?: string;
    skinIssues?: string;
    photoUrl?: string;
    aiAnalysis?: any;
    technicianId?: number;
    notes?: string;
  }) {
    const record = this.skinRecordRepo.create({
      ...data,
      recordDate: new Date(),
    });
    return this.skinRecordRepo.save(record);
  }

  // 获取客户肤质记录
  async findByCustomer(customerId: number) {
    return this.skinRecordRepo.find({
      where: { customerId },
      order: { recordDate: 'DESC' },
    });
  }

  // 创建对比记录
  async createComparison(data: {
    customerId: number;
    beforeRecordId: number;
    afterRecordId: number;
    comparisonImageUrl?: string;
    improvementHighlights?: string;
  }) {
    const comparison = this.skinComparisonRepo.create(data);
    return this.skinComparisonRepo.save(comparison);
  }

  // 获取客户对比记录
  async findComparisonsByCustomer(customerId: number) {
    return this.skinComparisonRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }
}
