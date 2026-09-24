import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ collection: 'audit_logs', timestamps: false })
export class AuditLog {
  @Prop({ type: Types.ObjectId, index: true })
  actorId: Types.ObjectId;

  @Prop()
  actorName: string;

  @Prop({ required: true, index: true })
  action: string;

  @Prop({ type: Types.ObjectId, index: true })
  targetId: Types.ObjectId;

  @Prop()
  targetType: string;

  @Prop({ type: Object })
  before: Record<string, unknown>;

  @Prop({ type: Object })
  after: Record<string, unknown>;

  @Prop()
  ip: string;

  @Prop({ default: Date.now, index: true })
  createdAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
// Audit log is append-only — no updates or deletes ever
