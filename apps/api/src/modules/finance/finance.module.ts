import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceService } from './finance.service.js';
import { FinanceController } from './finance.controller.js';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema.js';
import { Membership, MembershipSchema } from '../memberships/schemas/membership.schema.js';
import { Member, MemberSchema } from '../members/schemas/member.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: Member.name, schema: MemberSchema },
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
