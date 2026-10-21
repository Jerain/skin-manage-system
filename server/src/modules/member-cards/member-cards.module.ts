import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberCardsController } from './member-cards.controller';
import { MemberCardsService } from './member-cards.service';
import { MemberCard } from '../../database/entities/member-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberCard])],
  controllers: [MemberCardsController],
  providers: [MemberCardsService],
  exports: [MemberCardsService],
})
export class MemberCardsModule {}
