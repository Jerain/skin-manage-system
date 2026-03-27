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
exports.MemberLevelsController = void 0;
const common_1 = require("@nestjs/common");
const member_levels_service_1 = require("./member-levels.service");
let MemberLevelsController = class MemberLevelsController {
    constructor(memberLevelsService) {
        this.memberLevelsService = memberLevelsService;
    }
    getAllLevels() {
        return this.memberLevelsService.findAllLevels();
    }
    getCustomerLevel(customerId) {
        return this.memberLevelsService.getCustomerLevel(Number(customerId));
    }
    addGrowth(data) {
        return this.memberLevelsService.addGrowth(data.customerId, data.growthType, data.growthValue, data.relatedId);
    }
    getGrowthRecords(customerId) {
        return this.memberLevelsService.getGrowthRecords(Number(customerId));
    }
    checkUpgrade(customerId) {
        return this.memberLevelsService.checkUpgrade(Number(customerId));
    }
};
exports.MemberLevelsController = MemberLevelsController;
__decorate([
    (0, common_1.Get)('member-levels'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MemberLevelsController.prototype, "getAllLevels", null);
__decorate([
    (0, common_1.Get)('customer-level/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MemberLevelsController.prototype, "getCustomerLevel", null);
__decorate([
    (0, common_1.Post)('growth-records'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MemberLevelsController.prototype, "addGrowth", null);
__decorate([
    (0, common_1.Get)('growth-records/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MemberLevelsController.prototype, "getGrowthRecords", null);
__decorate([
    (0, common_1.Post)('customer-level/:customerId/upgrade'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MemberLevelsController.prototype, "checkUpgrade", null);
exports.MemberLevelsController = MemberLevelsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [member_levels_service_1.MemberLevelsService])
], MemberLevelsController);
//# sourceMappingURL=member-levels.controller.js.map