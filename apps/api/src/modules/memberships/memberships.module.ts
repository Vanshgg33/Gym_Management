import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipsService } from './memberships.service.js';
import { MembershipsController } from './memberships.controller.js';
import { Membership, MembershipSchema } from './schemas/membership.schema.js';
import { Member, MemberSchema } from '../members/schemas/member.schema.js';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema.js';
import { Invoice, InvoiceSchema } from '../payments/schemas/invoice.schema.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Membership.name, schema: MembershipSchema },
      { name: Member.name, schema: MemberSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
    AuditModule,
  ],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
