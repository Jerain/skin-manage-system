import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberLevel } from '../../database/entities/member-level.entity';
import { CustomerLevel } from '../../database/entities/customer-level.entity';
import { GrowthRecord } from '../../database/entities/growth-record.entity';

@Injectable()
export class MemberLevelsService {
  constructor(
    @InjectRepository(MemberLevel)
    private memberLevelRepo: Repository<MemberLevel>,
    @InjectRepository(CustomerLevel)
    private customerLevelRepo: Repository<CustomerLevel>,
    @InjectRepository(GrowthRecord)
    private growthRecordRepo: Repository<GrowthRecord>,
  ) {}

  // Get all member levels
  async findAllLevels() {
    return this.memberLevelRepo.find({ order: { threshold: 'ASC' } });
  }

  // Get customer level info
  async getCustomerLevel(customerId: number) {
    let customerLevel = await this.customerLevelRepo.findOne({ where: { customerId } });
    
    // If not exists, create default
    if (!customerLevel) {
      customerLevel = this.customerLevelRepo.create({
        customerId,
        levelId: 1, // Default to first level (新手)
        growthValue: 0,
        totalPoints: 0,
        availablePoints: 0,
      });
      customerLevel = await this.customerLevelRepo.save(customerLevel);
    }
    
    // Get level details
    const levels = await this.findAllLevels();
    const currentLevel = levels.find(l => l.id === customerLevel.levelId) || levels[0];
    
    return {
      ...customerLevel,
      levelName: currentLevel?.levelName,
      levelCode: currentLevel?.levelCode,
      discount: currentLevel?.discount,
      nextLevel: levels.find(l => l.threshold > (currentLevel?.threshold || 0)),
    };
  }

  // Add growth value
  async addGrowth(customerId: number, type: string, value: number, relatedId?: number) {
    // Get customer level
    let customerLevel = await this.customerLevelRepo.findOne({ where: { customerId } });
    
    // Create if not exists
    if (!customerLevel) {
      customerLevel = this.customerLevelRepo.create({
        customerId,
        levelId: 1,
        growthValue: 0,
        totalPoints: 0,
        availablePoints: 0,
      });
      customerLevel = await this.customerLevelRepo.save(customerLevel);
    }
    
    // Calculate growth value based on type
    let growthValue = value;
    if (type === '签到') growthValue = 10;
    else if (type === '评价') growthValue = 20;
    else if (type === '推荐') growthValue = 100;
    // 消费: 1元 = 1成长值
    
    // Update customer level
    customerLevel.growthValue += growthValue;
    customerLevel.totalPoints += growthValue;
    customerLevel.availablePoints += growthValue;
    await this.customerLevelRepo.save(customerLevel);
    
    // Record growth
    const record = this.growthRecordRepo.create({
      customerId,
      growthType: type,
      growthValue,
      relatedId,
    });
    await this.growthRecordRepo.save(record);
    
    // Check for upgrade
    await this.checkUpgrade(customerId);
    
    return customerLevel;
  }

  // Check and upgrade if needed
  async checkUpgrade(customerId: number) {
    const customerLevel = await this.customerLevelRepo.findOne({ where: { customerId } });
    if (!customerLevel) return customerLevel;
    
    const levels = await this.findAllLevels();
    let upgraded = false;
    
    // Check if eligible for upgrade (from highest to lowest)
    for (const level of levels.reverse()) {
      if (customerLevel.growthValue >= level.threshold && level.id > customerLevel.levelId) {
        customerLevel.levelId = level.id;
        upgraded = true;
        break;
      }
    }
    
    if (upgraded) {
      await this.customerLevelRepo.save(customerLevel);
    }
    
    return customerLevel;
  }

  // Get growth records
  async getGrowthRecords(customerId: number) {
    return this.growthRecordRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }
}
