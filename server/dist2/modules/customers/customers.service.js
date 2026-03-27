"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../../database/entities/customer.entity");
const bcrypt = __importStar(require("bcrypt"));
let CustomersService = class CustomersService {
    constructor(customerRepo) {
        this.customerRepo = customerRepo;
    }
    async findAll() {
        return this.customerRepo.find({ order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const customer = await this.customerRepo.findOne({ where: { id } });
        if (!customer)
            throw new common_1.NotFoundException('客户不存在');
        return customer;
    }
    async findByPhone(phone) {
        return this.customerRepo.findOne({ where: { phone } });
    }
    async findByFaceToken(faceToken) {
        return this.customerRepo.findOne({ where: { faceToken } });
    }
    async create(data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        const customer = this.customerRepo.create(data);
        return this.customerRepo.save(customer);
    }
    async update(id, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        await this.customerRepo.update(id, data);
        return this.findOne(id);
    }
    async delete(id) {
        await this.customerRepo.delete(id);
        return { success: true };
    }
    async validatePassword(customer, password) {
        if (!customer.password)
            return false;
        return bcrypt.compare(password, customer.password);
    }
    async updateBalance(id, amount, type) {
        const customer = await this.findOne(id);
        if (type === 'subtract' && customer.balance < amount) {
            throw new Error('余额不足');
        }
        await this.customerRepo.update(id, {
            balance: type === 'add' ? customer.balance + amount : customer.balance - amount,
        });
        return this.findOne(id);
    }
    async updatePoints(id, points, type) {
        const customer = await this.findOne(id);
        await this.customerRepo.update(id, {
            points: type === 'add' ? customer.points + points : customer.points - points,
        });
        return this.findOne(id);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map