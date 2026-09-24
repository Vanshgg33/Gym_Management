import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DietPlanDocument = DietPlan & Document;

const MealItemSchema = {
  name: String,
  quantity: String,
  calories: Number,
  protein: Number,
};

const MealSchema = {
  slot: {
    type: String,
    enum: ['early_morning', 'breakfast', 'mid_morning', 'lunch', 'evening_snack',
      'pre_workout', 'post_workout', 'dinner', 'bedtime'],
  },
  name: String,
  items: { type: [MealItemSchema], default: [] },
  note: String,
};

@Schema({ timestamps: true, collection: 'diet_plans' })
export class DietPlan {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'general_fitness'],
    index: true,
  })
  goal: string;

  @Prop({ enum: ['veg', 'non_veg', 'egg_itarian', 'vegan'] })
  dietType: string;

  @Prop({ type: Number })
  dailyCalories: number;

  @Prop({ enum: ['low', 'moderate', 'high', 'very_high'], default: 'moderate' })
  proteinLevel: string;

  @Prop({ type: [MealSchema], default: [] })
  meals: {
    slot: string;
    name: string;
    items: { name: string; quantity?: string; calories?: number; protein?: number }[];
    note?: string;
  }[];

  @Prop({ default: false })
  isTemplate: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Member' })
  assignedToMemberId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DietPlan' })
  templateId: Types.ObjectId;

  @Prop({ enum: ['active', 'paused', 'completed', 'archived'], default: 'active' })
  status: string;

  @Prop({ default: false })
  isArchived: boolean;
}

export const DietPlanSchema = SchemaFactory.createForClass(DietPlan);
