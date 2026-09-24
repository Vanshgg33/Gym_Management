import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkoutPlanDocument = WorkoutPlan & Document;

const ExerciseEntrySchema = {
  exerciseId: { type: Types.ObjectId, ref: 'Exercise' },
  exerciseName: String,
  sets: Number,
  reps: Number,
  durationMinutes: Number,
  restSeconds: Number,
  notes: String,
};

const DaySchema = {
  dayNumber: Number,
  name: String,
  focus: String,
  isRestDay: { type: Boolean, default: false },
  exercises: { type: [ExerciseEntrySchema], default: [] },
};

@Schema({ timestamps: true, collection: 'workout_plans' })
export class WorkoutPlan {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    enum: ['weight_loss', 'muscle_gain', 'general_fitness', 'strength', 'endurance', 'toning'],
    index: true,
  })
  goal: string;

  @Prop({ enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty: string;

  @Prop({ type: Number, default: 4, min: 1, max: 7 })
  daysPerWeek: number;

  @Prop({ enum: ['any', 'male', 'female'] })
  targetGender: string;

  @Prop({ type: [DaySchema], default: [] })
  days: {
    dayNumber: number;
    name: string;
    focus?: string;
    isRestDay: boolean;
    exercises: {
      exerciseId?: Types.ObjectId;
      exerciseName: string;
      sets?: number;
      reps?: number;
      durationMinutes?: number;
      restSeconds?: number;
      notes?: string;
    }[];
  }[];

  @Prop({ default: false })
  isTemplate: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Member' })
  assignedToMemberId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WorkoutPlan' })
  templateId: Types.ObjectId;

  @Prop({ enum: ['active', 'paused', 'completed', 'archived'], default: 'active' })
  status: string;

  @Prop({ default: false })
  isArchived: boolean;
}

export const WorkoutPlanSchema = SchemaFactory.createForClass(WorkoutPlan);
