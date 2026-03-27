"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAssistantModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const ai_assistant_controller_1 = require("./ai-assistant.controller");
const ai_assistant_service_1 = require("./ai-assistant.service");
const customers_module_1 = require("../customers/customers.module");
const stores_module_1 = require("../stores/stores.module");
const services_module_1 = require("../services/services.module");
const employees_module_1 = require("../employees/employees.module");
const appointments_module_1 = require("../appointments/appointments.module");
const orders_module_1 = require("../orders/orders.module");
let AiAssistantModule = class AiAssistantModule {
};
exports.AiAssistantModule = AiAssistantModule;
exports.AiAssistantModule = AiAssistantModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            customers_module_1.CustomersModule,
            stores_module_1.StoresModule,
            services_module_1.ServicesModule,
            employees_module_1.EmployeesModule,
            appointments_module_1.AppointmentsModule,
            orders_module_1.OrdersModule,
        ],
        controllers: [ai_assistant_controller_1.AiAssistantController],
        providers: [ai_assistant_service_1.AiAssistantService],
        exports: [ai_assistant_service_1.AiAssistantService],
    })
], AiAssistantModule);
//# sourceMappingURL=ai-assistant.module.js.map