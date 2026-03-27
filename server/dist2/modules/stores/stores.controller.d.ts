import { StoresService } from './stores.service';
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    findAll(): Promise<import("../../database/entities/store.entity").Store[]>;
    findOne(id: string): Promise<import("../../database/entities/store.entity").Store>;
    create(data: any): Promise<import("../../database/entities/store.entity").Store>;
    update(id: string, data: any): Promise<import("../../database/entities/store.entity").Store>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
