import { Store } from './store.entity';
export declare class Employee {
    id: number;
    storeId: number;
    store: Store;
    name: string;
    phone: string;
    password: string;
    role: string;
    position: string;
    avatar: string;
    faceToken: string;
    skills: number[];
    rating: number;
    status: number;
    createdAt: Date;
    updatedAt: Date;
}
