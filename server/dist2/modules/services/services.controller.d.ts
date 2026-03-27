import { ServicesService } from './services.service';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findAllCategories(): Promise<import("../../database/entities/service.entity").ServiceCategory[]>;
    findCategory(id: string): Promise<import("../../database/entities/service.entity").ServiceCategory[]>;
    createCategory(data: any): Promise<import("../../database/entities/service.entity").ServiceCategory>;
    updateCategory(id: string, data: any): Promise<import("../../database/entities/service.entity").ServiceCategory>;
    deleteCategory(id: string): Promise<{
        success: boolean;
    }>;
    findAll(storeId?: string): Promise<import("../../database/entities/service.entity").Service[]>;
    findByCategory(categoryId: string, storeId?: string): Promise<import("../../database/entities/service.entity").Service[]>;
    findOne(id: string): Promise<import("../../database/entities/service.entity").Service>;
    create(data: any): Promise<import("../../database/entities/service.entity").Service>;
    update(id: string, data: any): Promise<import("../../database/entities/service.entity").Service>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
