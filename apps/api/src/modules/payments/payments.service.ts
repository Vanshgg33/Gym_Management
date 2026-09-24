import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema.js';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private auditService: AuditService,
  ) {}

  async findByMembershipId(membershipId: string) {
    return this.paymentModel.find({ membershipId }).sort({ createdAt: -1 }).exec();
  }

  async findByMemberId(memberId: string) {
    return this.paymentModel.find({ memberId }).sort({ createdAt: -1 }).exec();
  }

  async create(data: Partial<Payment>, session?: ClientSession) {
    const [payment] = await this.paymentModel.create([data], session ? { session } : {});
    return payment;
  }

  async delete(id: string, actorId?: string) {
    const payment = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!payment) throw new NotFoundException('Payment not found');

    await this.auditService.log({
      actorId,
      action: 'payment.deleted',
      targetId: id,
      targetType: 'Payment',
      before: { totalInPaise: payment.totalInPaise },
    });

    return payment;
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getUTCFullYear();
    const count = await this.invoiceModel.countDocuments({
      createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) },
    });
    const seq = String(count + 1).padStart(6, '0');
    return `INV-${year}-${seq}`;
  }

  async createInvoice(data: Partial<Invoice>) {
    return this.invoiceModel.create(data);
  }
}
