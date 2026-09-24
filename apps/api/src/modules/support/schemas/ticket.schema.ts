import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true, collection: 'support_tickets' })
export class Ticket {
  @Prop({ required: true })
  subject: string;

  @Prop({
    required: true,
    enum: ['platform', 'internal', 'member_feedback', 'plan_request'],
    index: true,
  })
  ticketType: string;

  @Prop({
    enum: ['general', 'billing', 'technical', 'feature_request', 'bug_report'],
    default: 'general',
  })
  category: string;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: string;

  @Prop()
  description: string;

  @Prop({
    enum: ['open', 'in_progress', 'waiting_for_client', 'resolved', 'closed'],
    default: 'open',
    index: true,
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  raisedById: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedToId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  attachmentUrls: string[];

  @Prop({
    type: [
      {
        authorId: Types.ObjectId,
        authorName: String,
        body: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  replies: { authorId: Types.ObjectId; authorName: string; body: string; createdAt: Date }[];

  @Prop({ default: false })
  isRead: boolean;

  // For member feedback
  @Prop({ type: Number, min: 1, max: 5 })
  rating: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ratedStaffId: Types.ObjectId;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
