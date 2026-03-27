import { Repository } from 'typeorm';
import { Service, ServiceCategory } from '../../database/entities/service.entity';
export declare class ServicesService {
    private serviceRepo;
    private categoryRepo;
    constructor(serviceRepo: Repository<Service>, categoryRepo: Repository<ServiceCategory>);
    findAllCategories(): Promise<ServiceCategory[]>;
    findAll(storeId?: number): Promise<Service[]>;
    findByCategory(categoryId: number, storeId?: number): Promise<Service[]>;
    findOne(id: number): Promise<Service>;
    create(data: Partial<Service>): Promise<Service>;
    update(id: number, data: Partial<Service>): Promise<Service>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
    createCategory(data: Partial<ServiceCategory>): Promise<ServiceCategory>;
    updateCategory(id: number, data: Partial<ServiceCategory>): Promise<ServiceCategory>;
    deleteCategory(id: number): Promise<{
        success: boolean;
    }>;
}
