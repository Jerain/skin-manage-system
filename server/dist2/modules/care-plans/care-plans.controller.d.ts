import { CarePlansService } from './care-plans.service';
export declare class CarePlansController {
    private readonly carePlansService;
    constructor(carePlansService: CarePlansService);
    create(data: any): Promise<import("../../database/entities/care-plan.entity").CarePlan[]>;
    findByCustomer(customerId: string): Promise<import("../../database/entities/care-plan.entity").CarePlan[]>;
    findById(id: string): Promise<import("../../database/entities/care-plan.entity").CarePlan | {
        items: import("../../database/entities/care-plan-item.entity").CarePlanItem[];
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
