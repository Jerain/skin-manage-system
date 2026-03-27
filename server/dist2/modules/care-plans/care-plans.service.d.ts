import { Repository } from 'typeorm';
import { CarePlan } from '../../database/entities/care-plan.entity';
import { CarePlanItem } from '../../database/entities/care-plan-item.entity';
export declare class CarePlansService {
    private carePlanRepo;
    private carePlanItemRepo;
    constructor(carePlanRepo: Repository<CarePlan>, carePlanItemRepo: Repository<CarePlanItem>);
    create(data: {
        customerId: number;
        planStartDate: string;
        planEndDate: string;
        skinType: string;
        season: string;
        planItems?: any[];
    }): Promise<CarePlan[]>;
    findByCustomer(customerId: number): Promise<CarePlan[]>;
    findById(id: number): Promise<CarePlan | {
        items: CarePlanItem[];
        id: number;
        customerId: number;
        planStartDate: string;
        planEndDate: string;
        skinType: string;
        season: string;
        planItems: any;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
