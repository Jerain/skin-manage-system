import { Repository } from 'typeorm';
import { MemberLevel } from '../../database/entities/member-level.entity';
import { CustomerLevel } from '../../database/entities/customer-level.entity';
import { GrowthRecord } from '../../database/entities/growth-record.entity';
export declare class MemberLevelsService {
    private memberLevelRepo;
    private customerLevelRepo;
    private growthRecordRepo;
    constructor(memberLevelRepo: Repository<MemberLevel>, customerLevelRepo: Repository<CustomerLevel>, growthRecordRepo: Repository<GrowthRecord>);
    findAllLevels(): Promise<MemberLevel[]>;
    getCustomerLevel(customerId: number): Promise<{
        levelName: string;
        levelCode: string;
        discount: number;
        nextLevel: MemberLevel;
        id: number;
        customerId: number;
        levelId: number;
        growthValue: number;
        totalPoints: number;
        availablePoints: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addGrowth(customerId: number, type: string, value: number, relatedId?: number): Promise<CustomerLevel>;
    checkUpgrade(customerId: number): Promise<CustomerLevel>;
    getGrowthRecords(customerId: number): Promise<GrowthRecord[]>;
}
