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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_entity_1 = require("../../database/entities/service.entity");
let ServicesService = class ServicesService {
    constructor(serviceRepo, categoryRepo) {
        this.serviceRepo = serviceRepo;
        this.categoryRepo = categoryRepo;
    }
    async findAllCategories() {
        return this.categoryRepo.find({ where: { status: 1 }, order: { sortOrder: 'ASC' } });
    }
    async findAll(storeId) {
        const where = { status: 1 };
        if (storeId)
            where.storeId = storeId;
        return this.serviceRepo.find({
            where,
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
            relations: ['store']
        });
    }
    async findByCategory(categoryId, storeId) {
        const where = { categoryId, status: 1 };
        if (storeId)
            where.storeId = storeId;
        return this.serviceRepo.find({ where, order: { sortOrder: 'ASC' } });
    }
    async findOne(id) {
        const service = await this.serviceRepo.findOne({
            where: { id },
            relations: ['store']
        });
        if (!service)
            throw new common_1.NotFoundException('服务项目不存在');
        return service;
    }
    async create(data) {
        const service = this.serviceRepo.create(data);
        return this.serviceRepo.save(service);
    }
    async update(id, data) {
        await this.serviceRepo.update(id, data);
        return this.findOne(id);
    }
    async delete(id) {
        await this.serviceRepo.update(id, { status: 0 });
        return { success: true };
    }
    async createCategory(data) {
        const category = this.categoryRepo.create(data);
        return this.categoryRepo.save(category);
    }
    async updateCategory(id, data) {
        await this.categoryRepo.update(id, data);
        return this.categoryRepo.findOne({ where: { id } });
    }
    async deleteCategory(id) {
        await this.categoryRepo.update(id, { status: 0 });
        return { success: true };
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __param(1, (0, typeorm_1.InjectRepository)(service_entity_1.ServiceCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ServicesService);
//# sourceMappingURL=services.service.js.map