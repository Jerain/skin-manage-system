import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    customerLogin(body: {
        phone: string;
        password: string;
    }): Promise<{
        access_token: string;
        customer: {
            id: number;
            name: string;
            phone: string;
            avatar: string;
            level: number;
            balance: number;
            points: number;
        };
    }>;
    customerRegister(body: {
        phone: string;
        password: string;
        name?: string;
    }): Promise<{
        access_token: string;
        customer: {
            id: number;
            name: string;
            phone: string;
        };
    }>;
    employeeLogin(body: {
        phone: string;
        password: string;
    }): Promise<{
        access_token: string;
        employee: {
            id: number;
            name: string;
            phone: string;
            role: string;
            position: string;
            storeId: number;
            avatar: string;
        };
    }>;
    adminLogin(body: {
        username: string;
        password: string;
    }): Promise<{
        access_token: string;
        admin: {
            id: number;
            username: string;
            name: string;
            role: string;
            storeId: number;
        };
    }>;
    faceLogin(body: {
        faceToken: string;
        userType: 'customer' | 'employee';
    }): Promise<{
        access_token: string;
        employee: {
            id: number;
            name: string;
            phone: string;
            role: string;
            position: string;
            storeId: number;
            avatar: string;
        };
        customer?: undefined;
    } | {
        access_token: string;
        customer: {
            id: number;
            name: string;
            phone: string;
            avatar: string;
            level: number;
            balance: number;
            points: number;
        };
        employee?: undefined;
    }>;
    verifyToken(auth: string): any;
}
