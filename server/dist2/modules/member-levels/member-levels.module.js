"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberLevelsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const member_levels_controller_1 = require("./member-levels.controller");
const member_levels_service_1 = require("./member-levels.service");
const member_level_entity_1 = require("../../database/entities/member-level.entity");
const customer_level_entity_1 = require("../../database/entities/customer-level.entity");
const growth_record_entity_1 = require("../../database/entities/growth-record.entity");
let MemberLevelsModule = class MemberLevelsModule {
};
exports.MemberLevelsModule = MemberLevelsModule;
exports.MemberLevelsModule = MemberLevelsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([member_level_entity_1.MemberLevel, customer_level_entity_1.CustomerLevel, growth_record_entity_1.GrowthRecord])],
        controllers: [member_levels_controller_1.MemberLevelsController],
        providers: [member_levels_service_1.MemberLevelsService],
        exports: [member_levels_service_1.MemberLevelsService],
    })
], MemberLevelsModule);
//# sourceMappingURL=member-levels.module.js.map