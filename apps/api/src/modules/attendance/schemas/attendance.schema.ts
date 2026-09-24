import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true, collection: 'attendance' })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'Member', index: true })
  memberId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  staffId: Types.ObjectId;

  @Prop({ required: true })
  checkIn: Date;

  @Prop()
  checkOut: Date;

  @Prop({ enum: ['manual', 'self', 'biometric'], default: 'manual' })
  source: string;

  @Prop()
  notes: string;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({ default: false })
  isStaff: boolean;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ memberId: 1, checkIn: -1 });
AttendanceSchema.index({ checkIn: 1 });
