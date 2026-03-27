import { MemberLevelsService } from './member-levels.service';
export declare class MemberLevelsController {
    private readonly memberLevelsService;
    constructor(memberLevelsService: MemberLevelsService);
    getAllLevels(): Promise<import("../../database/entities/member-level.entity").MemberLevel[]>;
    getCustomerLevel(customerId: string): Promise<{
        levelName: string;
        levelCode: string;
        discount: number;
        nextLevel: import("../../database/entities/member-level.entity").MemberLevel;
        id: number;
        customerId: number;
        levelId: number;
        growthValue: number;
        totalPoints: number;
        availablePoints: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addGrowth(data: {
        customerId: number;
        growthType: string;
        growthValue: number;
        relatedId?: number;
    }): Promise<import("../../database/entities/customer-level.entity").CustomerLevel>;
    getGrowthRecords(customerId: string): Promise<import("../../database/entities/growth-record.entity").GrowthRecord[]>;
    checkUpgrade(customerId: string): Promise<import("../../database/entities/customer-level.entity").CustomerLevel>;
}
