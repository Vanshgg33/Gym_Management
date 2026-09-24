import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClassDocument = Class & Document;

@Schema({ timestamps: true, collection: 'classes' })
export class Class {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    required: true,
    enum: ['yoga', 'hiit', 'strength', 'cardio', 'dance', 'pilates', 'boxing', 'spinning', 'crossfit', 'meditation', 'other'],
  })
  category: string;

  @Prop({ enum: ['beginner', 'intermediate', 'advanced', 'all_levels'], default: 'all_levels' })
  difficulty: string;

  @Prop({ type: Number, default: 60 })
  durationMinutes: number;

  @Prop({ type: Number, default: 20 })
  maxCapacity: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  trainerId: Types.ObjectId;

  @Prop({
    type: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 },
        startTime: String,
        endTime: String,
      },
    ],
    default: [],
  })
  schedule: { dayOfWeek: number; startTime: string; endTime: string }[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
