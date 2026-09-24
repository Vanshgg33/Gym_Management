import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StaffDocument = Staff & Document;

@Schema({ timestamps: true, collection: 'staff_profiles' })
export class Staff {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({
    type: {
      type: { type: String, enum: ['single', 'split'], default: 'single' },
      morning: { start: String, end: String },
      evening: { start: String, end: String },
      single: { start: String, end: String },
      weeklyOff: { type: [String], default: ['sunday'] },
    },
    default: {},
  })
  dutyTime: {
    type: string;
    morning?: { start: string; end: string };
    evening?: { start: string; end: string };
    single?: { start: string; end: string };
    weeklyOff: string[];
  };

  @Prop({
    type: {
      baseSalaryInPaise: { type: Number, default: 0 },
      workingDaysPerMonth: { type: Number, default: 26 },
      paidLeavesPerMonth: { type: Number, default: 0 },
      effectiveFrom: Date,
    },
    default: {},
  })
  salary: {
    baseSalaryInPaise: number;
    workingDaysPerMonth: number;
    paidLeavesPerMonth: number;
    effectiveFrom?: Date;
  };

  @Prop({ type: Number, default: 0 })
  totalAdvanceInPaise: number;

  @Prop({
    type: [
      {
        month: String,
        year: Number,
        daysPresent: Number,
        daysLate: Number,
        paidLeaveUsed: Number,
        netPayInPaise: Number,
        advanceDeductedInPaise: Number,
        status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
        paidAt: Date,
        expenseId: Types.ObjectId,
      },
    ],
    default: [],
  })
  payrollHistory: {
    month: string;
    year: number;
    daysPresent: number;
    daysLate: number;
    paidLeaveUsed: number;
    netPayInPaise: number;
    advanceDeductedInPaise: number;
    status: string;
    paidAt?: Date;
    expenseId?: Types.ObjectId;
  }[];
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
