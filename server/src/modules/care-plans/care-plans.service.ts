import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarePlan } from '../../database/entities/care-plan.entity';
import { CarePlanItem } from '../../database/entities/care-plan-item.entity';

@Injectable()
export class CarePlansService {
  constructor(
    @InjectRepository(CarePlan)
    private carePlanRepo: Repository<CarePlan>,
    @InjectRepository(CarePlanItem)
    private carePlanItemRepo: Repository<CarePlanItem>,
  ) {}

  async create(data: {
    customerId: number;
    planStartDate: string;
    planEndDate: string;
    skinType: string;
    season: string;
    planItems?: any[];
  }) {
    const carePlan = this.carePlanRepo.create(data);
    const saved = await this.carePlanRepo.save(carePlan);
    
    // Create plan items if provided
    if (data.planItems && data.planItems.length > 0) {
      for (const item of data.planItems) {
        const planItem = this.carePlanItemRepo.create({
          planId: saved.id,
          serviceId: item.serviceId,
          plannedMonth: item.month,
          suggestedDate: item.suggestedDate,
          status: 'pending',
        });
        await this.carePlanItemRepo.save(planItem);
      }
    }
    
    return this.findByCustomer(data.customerId);
  }

  async findByCustomer(customerId: number) {
    return this.carePlanRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number) {
    const plan = await this.carePlanRepo.findOne({ where: { id } });
    if (plan) {
      const items = await this.carePlanItemRepo.find({
        where: { planId: id },
        order: { plannedMonth: 'ASC' },
      });
      return { ...plan, items };
    }
    return plan;
  }
}
