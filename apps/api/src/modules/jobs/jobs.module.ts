import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { AttendanceModule } from '../attendance/attendance.module.js';
import { SettingsModule } from '../settings/settings.module.js';

@Module({
  imports: [MembershipsModule, AttendanceModule, SettingsModule],
  providers: [JobsService],
})
export class JobsModule {}
