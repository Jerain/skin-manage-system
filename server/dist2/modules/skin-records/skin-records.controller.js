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
exports.SkinRecordsController = void 0;
const common_1 = require("@nestjs/common");
const skin_records_service_1 = require("./skin-records.service");
let SkinRecordsController = class SkinRecordsController {
    constructor(skinRecordsService) {
        this.skinRecordsService = skinRecordsService;
    }
    create(data) {
        return this.skinRecordsService.create(data);
    }
    findByCustomer(customerId) {
        return this.skinRecordsService.findByCustomer(Number(customerId));
    }
    createComparison(data) {
        return this.skinRecordsService.createComparison(data);
    }
    findComparisons(customerId) {
        return this.skinRecordsService.findComparisonsByCustomer(Number(customerId));
    }
};
exports.SkinRecordsController = SkinRecordsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SkinRecordsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SkinRecordsController.prototype, "findByCustomer", null);
__decorate([
    (0, common_1.Post)('comparisons'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SkinRecordsController.prototype, "createComparison", null);
__decorate([
    (0, common_1.Get)('comparisons/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SkinRecordsController.prototype, "findComparisons", null);
exports.SkinRecordsController = SkinRecordsController = __decorate([
    (0, common_1.Controller)('skin-records'),
    __metadata("design:paramtypes", [skin_records_service_1.SkinRecordsService])
], SkinRecordsController);
//# sourceMappingURL=skin-records.controller.js.map