import { Store } from './store.entity';
export declare class ServiceCategory {
    id: number;
    name: string;
    icon: string;
    sortOrder: number;
    status: number;
    createdAt: Date;
}
export declare class Service {
    id: number;
    categoryId: number;
    storeId: number;
    store: Store;
    name: string;
    price: number;
    duration: number;
    description: string;
    effects: string;
    precautions: string;
    images: string;
    isFeatured: number;
    sortOrder: number;
    status: number;
    createdAt: Date;
    updatedAt: Date;
}
