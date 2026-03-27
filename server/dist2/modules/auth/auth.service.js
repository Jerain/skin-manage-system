"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const customers_service_1 = require("../customers/customers.service");
const employees_service_1 = require("../employees/employees.service");
const admin_service_1 = require("../admin/admin.service");
let AuthService = class AuthService {
    constructor(jwtService, customersService, employeesService, adminService) {
        this.jwtService = jwtService;
        this.customersService = customersService;
        this.employeesService = employeesService;
        this.adminService = adminService;
    }
    async customerLogin(phone, password) {
        const customer = await this.customersService.findByPhone(phone);
        if (!customer) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        const isValid = await this.customersService.validatePassword(customer, password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        if (customer.status === 0) {
            throw new common_1.UnauthorizedException('账号已被禁用');
        }
        const payload = { sub: customer.id, phone: customer.phone, type: 'customer' };
        return {
            access_token: this.jwtService.sign(payload),
            customer: {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                avatar: customer.avatar,
                level: customer.level,
                balance: customer.balance,
                points: customer.points,
            },
        };
    }
    async customerRegister(data) {
        const existing = await this.customersService.findByPhone(data.phone);
        if (existing) {
            throw new common_1.BadRequestException('该手机号已注册');
        }
        const customer = await this.customersService.create({
            phone: data.phone,
            password: data.password,
            name: data.name || '新用户',
        });
        const payload = { sub: customer.id, phone: customer.phone, type: 'customer' };
        return {
            access_token: this.jwtService.sign(payload),
            customer: {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
            },
        };
    }
    async employeeLogin(phone, password) {
        const employee = await this.employeesService.findByPhone(phone);
        if (!employee) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        const isValid = await this.employeesService.validatePassword(employee, password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        if (employee.status === 0) {
            throw new common_1.UnauthorizedException('账号已被禁用');
        }
        const payload = { sub: employee.id, phone: employee.phone, type: 'employee', role: employee.role };
        return {
            access_token: this.jwtService.sign(payload),
            employee: {
                id: employee.id,
                name: employee.name,
                phone: employee.phone,
                role: employee.role,
                position: employee.position,
                storeId: employee.storeId,
                avatar: employee.avatar,
            },
        };
    }
    async adminLogin(username, password) {
        const admin = await this.adminService.validateCredentials(username, password);
        if (!admin) {
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        const payload = { sub: admin.id, username: admin.username, type: 'admin', role: admin.role };
        return {
            access_token: this.jwtService.sign(payload),
            admin: {
                id: admin.id,
                username: admin.username,
                name: admin.name,
                role: admin.role,
                storeId: admin.storeId,
            },
        };
    }
    async faceLogin(faceToken, userType) {
        if (userType === 'employee') {
            const employee = await this.employeesService.findByFaceToken(faceToken);
            if (!employee) {
                throw new common_1.UnauthorizedException('人脸识别失败');
            }
            if (employee.status === 0) {
                throw new common_1.UnauthorizedException('账号已被禁用');
            }
            const payload = { sub: employee.id, phone: employee.phone, type: 'employee', role: employee.role };
            return {
                access_token: this.jwtService.sign(payload),
                employee: {
                    id: employee.id,
                    name: employee.name,
                    phone: employee.phone,
                    role: employee.role,
                    position: employee.position,
                    storeId: employee.storeId,
                    avatar: employee.avatar,
                },
            };
        }
        else {
            const customer = await this.customersService.findByFaceToken(faceToken);
            if (!customer) {
                throw new common_1.UnauthorizedException('人脸识别失败');
            }
            if (customer.status === 0) {
                throw new common_1.UnauthorizedException('账号已被禁用');
            }
            const payload = { sub: customer.id, phone: customer.phone, type: 'customer' };
            return {
                access_token: this.jwtService.sign(payload),
                customer: {
                    id: customer.id,
                    name: customer.name,
                    phone: customer.phone,
                    avatar: customer.avatar,
                    level: customer.level,
                    balance: customer.balance,
                    points: customer.points,
                },
            };
        }
    }
    validateToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch {
            throw new common_1.UnauthorizedException('无效的令牌');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        customers_service_1.CustomersService,
        employees_service_1.EmployeesService,
        admin_service_1.AdminService])
], AuthService);
//# sourceMappingURL=auth.service.js.map