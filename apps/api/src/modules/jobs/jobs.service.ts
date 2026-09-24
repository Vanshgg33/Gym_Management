import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  @Cron('0 0 * * *')
  async expirePackages() {
    this.logger.log('[JOB] expirePackages starting');
  }

  @Cron('*/5 * * * *')
  async autoCheckout() {
    this.logger.log('[JOB] autoCheckout starting');
  }

  @Cron('30 8 * * *')
  async birthdayGreetings() {
    this.logger.log('[JOB] birthdayGreetings starting');
  }

  @Cron('30 9 * * *')
  async renewalReminders() {
    this.logger.log('[JOB] renewalReminders starting');
  }

  @Cron('0 22 * * *')
  async dailyPulse() {
    this.logger.log('[JOB] dailyPulse starting');
  }

  @Cron('0 3 * * *')
  async recomputeTotals() {
    this.logger.log('[JOB] recomputeTotals starting');
  }
}
