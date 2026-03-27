"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkinRecordsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const skin_records_controller_1 = require("./skin-records.controller");
const skin_records_service_1 = require("./skin-records.service");
const skin_record_entity_1 = require("../../database/entities/skin-record.entity");
const skin_comparison_entity_1 = require("../../database/entities/skin-comparison.entity");
let SkinRecordsModule = class SkinRecordsModule {
};
exports.SkinRecordsModule = SkinRecordsModule;
exports.SkinRecordsModule = SkinRecordsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([skin_record_entity_1.SkinRecord, skin_comparison_entity_1.SkinComparison]),
        ],
        controllers: [skin_records_controller_1.SkinRecordsController],
        providers: [skin_records_service_1.SkinRecordsService],
        exports: [skin_records_service_1.SkinRecordsService],
    })
], SkinRecordsModule);
//# sourceMappingURL=skin-records.module.js.map