import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GymPackageDocument = GymPackage & Document;

@Schema({ timestamps: true, collection: 'packages' })
export class GymPackage {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  priceInPaise: number;

  @Prop({ required: true, type: Number })
  durationDays: number;

  @Prop({
    required: true,
    enum: ['membership', 'pt', 'sunnyHour'],
    default: 'membership',
    index: true,
  })
  type: string;

  @Prop({ type: Number })
  sessions: number;

  @Prop()
  sunnyHourFrom: string;

  @Prop()
  sunnyHourTo: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ default: false })
  showOnline: boolean;

  @Prop({ default: false, index: true })
  isArchived: boolean;
}

export const GymPackageSchema = SchemaFactory.createForClass(GymPackage);
