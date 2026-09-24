import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MemberDocument = Member & Document;

@Schema({ timestamps: true, collection: 'members' })
export class Member {
  @Prop({ required: true, unique: true, index: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  phone: string;

  @Prop()
  email: string;

  @Prop({ enum: ['male', 'female', 'other', 'prefer_not_to_say'] })
  gender: string;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  photoUrl: string;

  @Prop({
    enum: ['pending', 'active', 'inactive', 'archived', 'blocked'],
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop({ enum: ['walk_in', 'social_media', 'referral', 'online', 'advertisement', 'other'] })
  referenceSource: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  salesPersonId: Types.ObjectId;

  @Prop({ default: false })
  consentSigned: boolean;

  @Prop()
  consentPdfUrl: string;

  @Prop()
  idProofUrl: string;

  @Prop({
    type: { name: String, phone: String, relation: String },
    default: {},
  })
  emergencyContact: { name?: string; phone?: string; relation?: string };

  @Prop()
  address: string;

  @Prop({ enum: ['under_20', '20_35', '35_50', 'over_50'] })
  ageGroup: string;

  @Prop({
    type: { fingerprint: Boolean, face: Boolean, pin: Boolean },
    default: { fingerprint: false, face: false, pin: false },
  })
  biometric: { fingerprint: boolean; face: boolean; pin: boolean };

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ default: false })
  blockedByLimit: boolean;

  @Prop()
  notes: string;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
MemberSchema.index({ name: 'text', phone: 'text', code: 'text' });
