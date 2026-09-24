import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Membership', required: true, index: true })
  membershipId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Member', required: true, index: true })
  memberId: Types.ObjectId;

  @Prop({
    type: [
      {
        method: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'card', 'other'] },
        amountInPaise: Number,
        txRef: String,
      },
    ],
    required: true,
  })
  entries: { method: string; amountInPaise: number; txRef?: string }[];

  @Prop({ required: true, type: Number })
  totalInPaise: number;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ default: false })
  isBackdated: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  receivedById: Types.ObjectId;

  @Prop()
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'Invoice' })
  invoiceId: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ memberId: 1, date: -1 });
