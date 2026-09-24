import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExerciseDocument = Exercise & Document;

@Schema({ timestamps: true, collection: 'exercises' })
export class Exercise {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({
    required: true,
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'quadriceps', 'hamstrings', 'glutes', 'calves', 'core', 'full_body', 'cardio', 'stretching'],
  })
  muscleGroup: string;

  @Prop({
    enum: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell',
      'resistance_band', 'smith_machine', 'ez_bar', 'plate', 'trx', 'cardio_machine', 'none'],
    default: 'none',
  })
  equipment: string;

  @Prop({ enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
  difficulty: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  isCustom: boolean;

  @Prop({ default: false })
  isArchived: boolean;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
ExerciseSchema.index({ name: 'text' });
ExerciseSchema.index({ muscleGroup: 1 });
