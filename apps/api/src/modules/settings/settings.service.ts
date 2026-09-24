import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema.js';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
  ) {}

  async get(): Promise<SettingsDocument> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = await this.settingsModel.create({
        gymName: 'My Gym',
        pretendMode: process.env.PRETEND_MODE !== 'false',
      });
    }
    return settings;
  }

  async update(data: Partial<Settings>): Promise<SettingsDocument> {
    const settings = await this.get();
    Object.assign(settings, data);
    return settings.save();
  }

  async nextMemberCode(): Promise<string> {
    const settings = await this.settingsModel.findOneAndUpdate(
      {},
      { $inc: { memberIdCounter: 1 } },
      { new: true, upsert: true },
    ).exec();
    const prefix = settings!.memberIdPrefix || 'GYM';
    const num = String(settings!.memberIdCounter).padStart(4, '0');
    return `${prefix}${num}`;
  }

  async checkMemberLimit(): Promise<{ allowed: boolean; current: number; limit: number }> {
    const settings = await this.get();
    return { allowed: true, current: 0, limit: settings.memberLimit };
  }

  async checkStaffLimit(): Promise<{ allowed: boolean; current: number; limit: number }> {
    const settings = await this.get();
    return { allowed: true, current: 0, limit: settings.staffLimit };
  }

  async seedDefaultSettings(): Promise<void> {
    const existing = await this.settingsModel.findOne().exec();
    if (existing) return;
    await this.settingsModel.create({
      gymName: 'My Gym',
      memberIdPrefix: 'GYM',
      planName: 'freemium',
      memberLimit: 25,
      staffLimit: 5,
      smsCredits: 100,
      emailCredits: 500,
      pretendMode: true,
    });
  }
}
