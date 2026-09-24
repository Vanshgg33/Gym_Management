import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageLogDocument = MessageLog & Document;

@Schema({ timestamps: true, collection: 'message_logs' })
export class MessageLog {
  @Prop({ type: Types.ObjectId, index: true })
  recipientId: Types.ObjectId;

  @Prop({ required: true })
  recipientPhone: string;

  @Prop()
  recipientName: string;

  @Prop({ required: true, enum: ['sms', 'email', 'whatsapp'] })
  channel: string;

  @Prop({ enum: ['sent', 'failed', 'skipped'], default: 'sent' })
  status: string;

  @Prop({ enum: ['manual', 'automatic', 'system'], default: 'manual' })
  trigger: string;

  @Prop()
  templateName: string;

  @Prop()
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  errorMessage: string;

  @Prop({ default: false })
  isPretend: boolean;
}

export const MessageLogSchema = SchemaFactory.createForClass(MessageLog);
