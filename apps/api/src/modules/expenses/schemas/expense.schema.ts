import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true, collection: 'expenses' })
export class Expense {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, type: Number })
  amountInPaise: number;

  @Prop({
    required: true,
    enum: ['Rent', 'Electricity', 'Water', 'Internet', 'Equipment', 'Repairs & Maintenance',
      'Cleaning Supplies', 'Marketing', 'Staff Salary', 'Trainer Commission', 'Insurance',
      'Licenses & Permits', 'Other'],
  })
  category: string;

  @Prop({ required: true, enum: ['cash', 'upi', 'bank_transfer', 'cheque'] })
  paymentMethod: string;

  @Prop({ default: false })
  fromPettyCash: boolean;

  @Prop({ required: true })
  vendor: string;

  @Prop({ type: Number, default: 0 })
  gstAmountInPaise: number;

  @Prop()
  invoiceRef: string;

  @Prop()
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  addedById: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  linkedPayrollId: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });
