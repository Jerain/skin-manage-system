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
exports.CarePlansController = void 0;
const common_1 = require("@nestjs/common");
const care_plans_service_1 = require("./care-plans.service");
let CarePlansController = class CarePlansController {
    constructor(carePlansService) {
        this.carePlansService = carePlansService;
    }
    create(data) {
        return this.carePlansService.create(data);
    }
    findByCustomer(customerId) {
        return this.carePlansService.findByCustomer(Number(customerId));
    }
    findById(id) {
        return this.carePlansService.findById(Number(id));
    }
};
exports.CarePlansController = CarePlansController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CarePlansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarePlansController.prototype, "findByCustomer", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarePlansController.prototype, "findById", null);
exports.CarePlansController = CarePlansController = __decorate([
    (0, common_1.Controller)('care-plans'),
    __metadata("design:paramtypes", [care_plans_service_1.CarePlansService])
], CarePlansController);
//# sourceMappingURL=care-plans.controller.js.map