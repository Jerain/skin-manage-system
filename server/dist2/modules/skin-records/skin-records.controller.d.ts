import { SkinRecordsService } from './skin-records.service';
export declare class SkinRecordsController {
    private readonly skinRecordsService;
    constructor(skinRecordsService: SkinRecordsService);
    create(data: any): Promise<import("../../database/entities/skin-record.entity").SkinRecord>;
    findByCustomer(customerId: string): Promise<import("../../database/entities/skin-record.entity").SkinRecord[]>;
    createComparison(data: any): Promise<import("../../database/entities/skin-comparison.entity").SkinComparison>;
    findComparisons(customerId: string): Promise<import("../../database/entities/skin-comparison.entity").SkinComparison[]>;
}
