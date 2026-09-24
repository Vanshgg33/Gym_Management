import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpStoreDocument = OtpStore & Document;

@Schema({ collection: 'otp_store' })
export class OtpStore {
  @Prop({ required: true, unique: true, index: true })
  phone: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: Date.now, expires: 300 }) // TTL 5 minutes
  createdAt: Date;
}

export const OtpStoreSchema = SchemaFactory.createForClass(OtpStore);
