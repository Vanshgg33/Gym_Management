import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PettyCashDocument = PettyCash & Document;

@Schema({ timestamps: true, collection: 'petty_cash' })
export class PettyCash {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, type: Number })
  amountInPaise: number;

  @Prop({
    required: true,
    enum: ['top_up', 'withdrawal'],
    default: 'top_up',
  })
  entryType: string;

  @Prop({ enum: ['owner_cash', 'bank_withdrawal', 'counter_collection', 'other'] })
  source: string;

  @Prop()
  reference: string;

  @Prop()
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  addedById: Types.ObjectId;
}

export const PettyCashSchema = SchemaFactory.createForClass(PettyCash);
