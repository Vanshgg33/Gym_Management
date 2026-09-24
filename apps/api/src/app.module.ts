import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { MembersModule } from './modules/members/members.module.js';
import { PackagesModule } from './modules/packages/packages.module.js';
import { MembershipsModule } from './modules/memberships/memberships.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { AttendanceModule } from './modules/attendance/attendance.module.js';
import { FollowupsModule } from './modules/followups/followups.module.js';
import { FinanceModule } from './modules/finance/finance.module.js';
import { ExpensesModule } from './modules/expenses/expenses.module.js';
import { StaffModule } from './modules/staff/staff.module.js';
import { ClassesModule } from './modules/classes/classes.module.js';
import { InventoryModule } from './modules/inventory/inventory.module.js';
import { WorkoutPlansModule } from './modules/workout-plans/workout-plans.module.js';
import { DietPlansModule } from './modules/diet-plans/diet-plans.module.js';
import { ExercisesModule } from './modules/exercises/exercises.module.js';
import { CommunicationsModule } from './modules/communications/communications.module.js';
import { SupportModule } from './modules/support/support.module.js';
import { SettingsModule } from './modules/settings/settings.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { JobsModule } from './modules/jobs/jobs.module.js';
import { SeederModule } from './seed/seeder.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60_000, limit: 200 },
      { name: 'auth', ttl: 60_000, limit: 10 },
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    MembersModule,
    PackagesModule,
    MembershipsModule,
    PaymentsModule,
    AttendanceModule,
    FollowupsModule,
    FinanceModule,
    ExpensesModule,
    StaffModule,
    ClassesModule,
    InventoryModule,
    WorkoutPlansModule,
    DietPlansModule,
    ExercisesModule,
    CommunicationsModule,
    SupportModule,
    SettingsModule,
    AuditModule,
    JobsModule,
    ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? [SeederModule]
      : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
