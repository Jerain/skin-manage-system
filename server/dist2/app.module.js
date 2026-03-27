"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customers_module_1 = require("./modules/customers/customers.module");
const stores_module_1 = require("./modules/stores/stores.module");
const employees_module_1 = require("./modules/employees/employees.module");
const services_module_1 = require("./modules/services/services.module");
const appointments_module_1 = require("./modules/appointments/appointments.module");
const orders_module_1 = require("./modules/orders/orders.module");
const auth_module_1 = require("./modules/auth/auth.module");
const admin_module_1 = require("./modules/admin/admin.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const performance_module_1 = require("./modules/performance/performance.module");
const skin_records_module_1 = require("./modules/skin-records/skin-records.module");
const care_plans_module_1 = require("./modules/care-plans/care-plans.module");
const member_levels_module_1 = require("./modules/member-levels/member-levels.module");
const ai_assistant_module_1 = require("./modules/ai-assistant/ai-assistant.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 3306,
                username: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_NAME || 'skin_care',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
                logging: process.env.NODE_ENV === 'development',
            }),
            customers_module_1.CustomersModule,
            stores_module_1.StoresModule,
            employees_module_1.EmployeesModule,
            services_module_1.ServicesModule,
            appointments_module_1.AppointmentsModule,
            orders_module_1.OrdersModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            attendance_module_1.AttendanceModule,
            performance_module_1.PerformanceModule,
            skin_records_module_1.SkinRecordsModule,
            care_plans_module_1.CarePlansModule,
            member_levels_module_1.MemberLevelsModule,
            ai_assistant_module_1.AiAssistantModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map