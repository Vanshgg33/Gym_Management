import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

const PermMapSchema = {
  pages: { type: [String], default: [] },
  specialActions: { type: [String], default: [] },
};

@Schema({ timestamps: true, collection: 'settings' })
export class Settings {
  @Prop({ default: 'My Gym' })
  gymName: string;

  @Prop()
  ownerName: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop({ default: false })
  includePhoneOnInvoice: boolean;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop({ default: '' })
  memberIdPrefix: string;

  @Prop({ default: 0 })
  memberIdCounter: number;

  @Prop()
  logoUrl: string;

  @Prop()
  gstNumber: string;

  @Prop({ default: 9 })
  sgstPercent: number;

  @Prop({ default: 9 })
  cgstPercent: number;

  @Prop({ default: 'Asia/Kolkata' })
  timezone: string;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ default: '' })
  termsAndConditions: string;

  @Prop({ default: 60 })
  autoCheckoutMinutes: number;

  @Prop({ default: true })
  autoCheckoutEnabled: boolean;

  @Prop({ default: true })
  checkinSearchEnabled: boolean;

  @Prop({ default: true })
  showMembershipAmountOnCheckin: boolean;

  @Prop({
    type: {
      allowUnlimited: { type: Boolean, default: false },
      minDays: { type: Number, default: 0 },
      maxDays: { type: Number, default: 999999 },
    },
    default: {},
  })
  freezeSettings: {
    allowUnlimited: boolean;
    minDays: number;
    maxDays: number;
  };

  @Prop({
    type: {
      manager: { pages: [String], specialActions: [String] },
      frontdesk: { pages: [String], specialActions: [String] },
      trainer: { pages: [String], specialActions: [String] },
    },
    default: {
      manager: {
        pages: ['dashboard', 'members', 'followups', 'staff', 'attendance', 'workout-plans', 'diet-plans', 'support', 'settings'],
        specialActions: ['backdate_payment', 'collect_due', 'upgrade_package', 'edit_member', 'export_followups', 'export_finance'],
      },
      frontdesk: {
        pages: ['dashboard', 'members', 'attendance', 'support'],
        specialActions: ['collect_due', 'edit_member', 'export_followups'],
      },
      trainer: {
        pages: ['dashboard', 'attendance', 'workout-plans', 'diet-plans', 'support', 'settings'],
        specialActions: [],
      },
    },
  })
  permissions: {
    manager: { pages: string[]; specialActions: string[] };
    frontdesk: { pages: string[]; specialActions: string[] };
    trainer: { pages: string[]; specialActions: string[] };
  };

  @Prop({ default: false })
  smsEnabled: boolean;

  @Prop({ default: true })
  emailEnabled: boolean;

  @Prop({ default: false })
  whatsappEnabled: boolean;

  @Prop({ default: 100 })
  smsCredits: number;

  @Prop({ default: 500 })
  emailCredits: number;

  @Prop({ default: true })
  pretendMode: boolean;

  @Prop({ type: [String], default: [] })
  dailyPulseNumbers: string[];

  // Subscription plan
  @Prop({ default: 'freemium' })
  planName: string;

  @Prop({ default: 25 })
  memberLimit: number;

  @Prop({ default: 5 })
  staffLimit: number;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
