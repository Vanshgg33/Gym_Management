import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClassEnrollmentDocument = ClassEnrollment & Document;

@Schema({ timestamps: true, collection: 'class_enrollments' })
export class ClassEnrollment {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true, index: true })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Member', required: true, index: true })
  memberId: Types.ObjectId;

  @Prop({ enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' })
  status: string;

  @Prop()
  notes: string;
}

export const ClassEnrollmentSchema = SchemaFactory.createForClass(ClassEnrollment);
ClassEnrollmentSchema.index({ classId: 1, memberId: 1 }, { unique: true });
