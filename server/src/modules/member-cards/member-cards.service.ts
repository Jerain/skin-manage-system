import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberCard } from '../../database/entities/member-card.entity';

@Injectable()
export class MemberCardsService {
  constructor(
    @InjectRepository(MemberCard)
    private memberCardRepo: Repository<MemberCard>,
  ) {}

  /** 会员卡列表（BUG-103） */
  async findAll(customerId?: number, status?: string) {
    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const cards = await this.memberCardRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return cards.map((c) => ({
      ...c,
      remainingTimes: Math.max(0, (c.totalTimes || 0) - (c.usedTimes || 0)),
    }));
  }

  async findOne(id: number) {
    const card = await this.memberCardRepo.findOne({ where: { id } });
    if (!card) throw new NotFoundException('会员卡不存在');
    return {
      ...card,
      remainingTimes: Math.max(0, (card.totalTimes || 0) - (card.usedTimes || 0)),
    };
  }

  async create(data: Partial<MemberCard>) {
    const card = this.memberCardRepo.create({
      ...data,
      usedTimes: data.usedTimes || 0,
      status: data.status || 'active',
    });
    return this.memberCardRepo.save(card);
  }

  async update(id: number, data: Partial<MemberCard>) {
    await this.memberCardRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.memberCardRepo.delete(id);
    return { success: true };
  }

  /** 核销次数 */
  async useTimes(id: number, times = 1) {
    const card = await this.memberCardRepo.findOne({ where: { id } });
    if (!card) throw new NotFoundException('会员卡不存在');
    const remaining = (card.totalTimes || 0) - (card.usedTimes || 0);
    if (remaining < times) {
      throw new NotFoundException('剩余次数不足');
    }
    card.usedTimes = (card.usedTimes || 0) + times;
    if (card.usedTimes >= card.totalTimes) {
      card.status = 'used';
    }
    await this.memberCardRepo.save(card);
    return this.findOne(id);
  }

  /** 扣减余额 */
  async deductBalance(id: number, amount: number) {
    const card = await this.memberCardRepo.findOne({ where: { id } });
    if (!card) throw new NotFoundException('会员卡不存在');
    if ((card.balance || 0) < amount) {
      throw new NotFoundException('余额不足');
    }
    card.balance = (card.balance || 0) - amount;
    await this.memberCardRepo.save(card);
    return this.findOne(id);
  }
}
