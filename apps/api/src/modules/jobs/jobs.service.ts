import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MembershipsService } from '../memberships/memberships.service.js';
import { AttendanceService } from '../attendance/attendance.service.js';
import { SettingsService } from '../settings/settings.service.js';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly membershipsService: MembershipsService,
    private readonly attendanceService: AttendanceService,
    private readonly settingsService: SettingsService,
  ) {}

  // Every night at midnight: expire packages, activate upcoming
  @Cron('0 0 * * *')
  async expirePackages() {
    this.logger.log('[JOB] expirePackages starting');
    const [expired, activated] = await Promise.all([
      this.membershipsService.expireOverdue(),
      this.membershipsService.activateUpcoming(),
    ]);
    this.logger.log(`[JOB] expirePackages done — expired: ${expired}, activated: ${activated}`);
  }

  // Every 5 minutes: auto check-out open visits
  @Cron('*/5 * * * *')
  async autoCheckout() {
    const settings = await this.settingsService.get();
    if (!settings.autoCheckoutEnabled) return;
    const count = await this.attendanceService.autoCheckout(settings.autoCheckoutMinutes);
    if (count > 0) this.logger.log(`[JOB] autoCheckout — closed ${count} open visits`);
  }

  // 8:30 daily: birthday greetings
  @Cron('30 8 * * *')
  async birthdayGreetings() {
    this.logger.log('[JOB] birthdayGreetings — pretend mode, no messages sent');
    // ponytail: stub — wire CommunicationsService when real SMS/WA enabled
  }

  // 9:30 daily: renewal reminders (7-day and same-day)
  @Cron('30 9 * * *')
  async renewalReminders() {
    const [today, week] = await Promise.all([
      this.membershipsService.findExpiredToday(),
      this.membershipsService.findExpiringInDays(7),
    ]);
    this.logger.log(`[JOB] renewalReminders — expiring today: ${today.length}, in 7 days: ${week.length}`);
    // ponytail: stub — send via CommunicationsService when enabled
  }

  // 10:00 daily: payment overdue reminders
  @Cron('0 10 * * *')
  async overdueReminders() {
    this.logger.log('[JOB] overdueReminders — pretend mode, no messages sent');
    // ponytail: stub — compute dues and notify
  }

  // 22:00 daily: daily pulse WhatsApp summary to owner
  @Cron('0 22 * * *')
  async dailyPulse() {
    const settings = await this.settingsService.get();
    if (!settings.whatsappEnabled) return;
    this.logger.log('[JOB] dailyPulse — WhatsApp disabled or pretend mode, skipping');
    // ponytail: stub — aggregate daily stats and send via WhatsApp provider
  }

  // 23:59 daily: roll up staff attendance Present/Late/Absent
  @Cron('59 23 * * *')
  async rollupStaffAttendance() {
    this.logger.log('[JOB] rollupStaffAttendance starting');
    // ponytail: stub — compute from attendance punches vs duty times
  }

  // 3:00 daily: recompute stored totals to correct drift
  @Cron('0 3 * * *')
  async recomputeTotals() {
    this.logger.log('[JOB] recomputeTotals starting');
    // ponytail: stub — recalculate paid/balance/live counts
  }
}
