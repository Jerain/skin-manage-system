import { Repository } from 'typeorm';
import { SkinRecord } from '../../database/entities/skin-record.entity';
import { SkinComparison } from '../../database/entities/skin-comparison.entity';
export declare class SkinRecordsService {
    private skinRecordRepo;
    private skinComparisonRepo;
    constructor(skinRecordRepo: Repository<SkinRecord>, skinComparisonRepo: Repository<SkinComparison>);
    create(data: {
        customerId: number;
        skinType?: string;
        skinIssues?: string;
        photoUrl?: string;
        aiAnalysis?: any;
        technicianId?: number;
        notes?: string;
    }): Promise<SkinRecord>;
    findByCustomer(customerId: number): Promise<SkinRecord[]>;
    createComparison(data: {
        customerId: number;
        beforeRecordId: number;
        afterRecordId: number;
        comparisonImageUrl?: string;
        improvementHighlights?: string;
    }): Promise<SkinComparison>;
    findComparisonsByCustomer(customerId: number): Promise<SkinComparison[]>;
}
