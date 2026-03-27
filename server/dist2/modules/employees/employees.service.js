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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("../../database/entities/employee.entity");
const bcrypt = __importStar(require("bcrypt"));
let EmployeesService = class EmployeesService {
    constructor(employeeRepo) {
        this.employeeRepo = employeeRepo;
    }
    async findAll(storeId) {
        const where = storeId ? { storeId, status: 1 } : { status: 1 };
        return this.employeeRepo.find({ where, order: { createdAt: 'DESC' } });
    }
    async findByStore(storeId) {
        return this.employeeRepo.find({
            where: { storeId, status: 1 },
            order: { createdAt: 'DESC' }
        });
    }
    async findOne(id) {
        const employee = await this.employeeRepo.findOne({ where: { id } });
        if (!employee)
            throw new common_1.NotFoundException('员工不存在');
        return employee;
    }
    async findByPhone(phone) {
        return this.employeeRepo.findOne({ where: { phone } });
    }
    async findByFaceToken(faceToken) {
        return this.employeeRepo.findOne({ where: { faceToken } });
    }
    async create(data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        const employee = this.employeeRepo.create(data);
        return this.employeeRepo.save(employee);
    }
    async update(id, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        await this.employeeRepo.update(id, data);
        return this.findOne(id);
    }
    async delete(id) {
        await this.employeeRepo.update(id, { status: 0 });
        return { success: true };
    }
    async validatePassword(employee, password) {
        if (!employee.password)
            return false;
        return bcrypt.compare(password, employee.password);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map