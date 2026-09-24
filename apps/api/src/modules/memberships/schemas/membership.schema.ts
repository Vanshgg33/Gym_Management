import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MembershipDocument = Membership & Document;

@Schema({ timestamps: true, collection: 'memberships' })
export class Membership {
  @Prop({ type: Types.ObjectId, ref: 'Member', required: true, index: true })
  memberId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'GymPackage' })
  packageId: Types.ObjectId;

  @Prop({ type: Object })
  packageSnapshot: {
    name: string;
    type: string;
    priceInPaise: number;
    durationDays: number;
    sessions?: number;
  };

  @Prop({ required: true, type: Number })
  salePriceInPaise: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true, index: true })
  endDate: Date;

  @Prop({
    enum: ['upcoming', 'active', 'frozen', 'expired', 'completed', 'transferred', 'cancelled'],
    default: 'active',
    index: true,
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  trainerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  salesPersonId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Discount' })
  discountId: Types.ObjectId;

  @Prop({
    type: [
      {
        startDate: Date,
        days: Number,
        feeInPaise: Number,
        paymentMethod: String,
        unfrozenAt: Date,
      },
    ],
    default: [],
  })
  freezes: {
    startDate: Date;
    days: number;
    feeInPaise: number;
    paymentMethod: string;
    unfrozenAt?: Date;
  }[];

  @Prop({ type: Number, default: 0 })
  sessionsTotal: number;

  @Prop({ type: Number, default: 0 })
  sessionsDone: number;

  @Prop({ type: Types.ObjectId })
  linkedFrom: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  linkedTo: Types.ObjectId;

  @Prop()
  adminNote: string;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
MembershipSchema.index({ memberId: 1, status: 1 });
