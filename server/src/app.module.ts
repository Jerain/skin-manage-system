import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './modules/customers/customers.module';
import { StoresModule } from './modules/stores/stores.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { ServicesModule } from './modules/services/services.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { SkinRecordsModule } from './modules/skin-records/skin-records.module';
import { CarePlansModule } from './modules/care-plans/care-plans.module';
import { MemberLevelsModule } from './modules/member-levels/member-levels.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'skin_care',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // 已在生产环境同步过，禁用防止重复
      logging: process.env.NODE_ENV === 'development',
    }),
    CustomersModule,
    StoresModule,
    EmployeesModule,
    ServicesModule,
    AppointmentsModule,
    OrdersModule,
    AuthModule,
    AdminModule,
    AttendanceModule,
    PerformanceModule,
    SkinRecordsModule,
    CarePlansModule,
    MemberLevelsModule,
    AiAssistantModule,
  ],
})
export class AppModule {}
