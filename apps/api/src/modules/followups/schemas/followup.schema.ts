import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FollowUpDocument = FollowUp & Document;

@Schema({ timestamps: true, collection: 'followups' })
export class FollowUp {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  contactId: Types.ObjectId;

  @Prop({ required: true, enum: ['member', 'visitor'] })
  contactType: string;

  @Prop({ required: true })
  subject: string;

  @Prop({
    required: true,
    enum: ['payment', 'renewal', 'visitor', 'inquiry', 'attendance'],
    index: true,
  })
  type: string;

  @Prop({ enum: ['normal', 'critical'], default: 'normal' })
  priority: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedToId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  amountInPaise: number;

  @Prop({ required: true, index: true })
  dueDate: Date;

  @Prop({ enum: ['open', 'completed'], default: 'open', index: true })
  status: string;

  @Prop({
    type: [{ note: String, changedById: Types.ObjectId, changedAt: Date }],
    default: [],
  })
  history: { note: string; changedById: Types.ObjectId; changedAt: Date }[];

  @Prop()
  closingNote: string;
}

export const FollowUpSchema = SchemaFactory.createForClass(FollowUp);
