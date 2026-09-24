import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true, collection: 'invoices' })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Member', required: true, index: true })
  memberId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Membership' })
  membershipId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  salePriceInPaise: number;

  @Prop({ type: Number, default: 0 })
  discountInPaise: number;

  @Prop({ required: true, type: Number })
  paidInPaise: number;

  @Prop({ type: Number, default: 0 })
  balanceInPaise: number;

  @Prop({ type: Number, default: 0 })
  cgstInPaise: number;

  @Prop({ type: Number, default: 0 })
  sgstInPaise: number;

  @Prop({ default: false })
  includeGst: boolean;

  @Prop({ type: [String], default: [] })
  paymentMethods: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  receivedById: Types.ObjectId;

  @Prop()
  packageName: string;

  @Prop()
  memberName: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
