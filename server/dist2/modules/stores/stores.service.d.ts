import { Repository } from 'typeorm';
import { Store } from '../../database/entities/store.entity';
export declare class StoresService {
    private storeRepo;
    constructor(storeRepo: Repository<Store>);
    findAll(): Promise<Store[]>;
    findOne(id: number): Promise<Store>;
    create(data: Partial<Store>): Promise<Store>;
    update(id: number, data: Partial<Store>): Promise<Store>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
