import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema.js';
import { Membership, MembershipDocument } from '../memberships/schemas/membership.schema.js';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>,
  ) {}

  async getRevenueData(from: Date, to: Date, filters: Record<string, unknown> = {}) {
    const query: Record<string, unknown> = {
      createdAt: { $gte: from, $lte: to },
      ...filters,
    };
    return this.paymentModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getSalesData(from: Date, to: Date, filters: Record<string, unknown> = {}) {
    const query: Record<string, unknown> = {
      createdAt: { $gte: from, $lte: to },
      ...filters,
    };
    return this.membershipModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getChartData(from: Date, to: Date) {
    // ponytail: stub — real impl aggregates by day/week/month per dataset
    return {
      revenue: [],
      sales: [],
      newMembers: [],
      renewals: [],
      freezes: [],
      expenses: [],
      attendance: [],
    };
  }

  async getCards(from: Date, to: Date) {
    const payments = await this.paymentModel
      .find({ createdAt: { $gte: from, $lte: to } })
      .select('totalInPaise')
      .exec();

    const revenueCollected = payments.reduce((sum, p) => sum + (p.totalInPaise ?? 0), 0);

    const memberships = await this.membershipModel
      .find({ createdAt: { $gte: from, $lte: to } })
      .select('salePriceInPaise')
      .exec();

    const totalSales = memberships.reduce((sum, m) => sum + (m.salePriceInPaise ?? 0), 0);
    const totalDue = 0; // computed from memberships - payments in real impl

    return {
      revenueCollected,
      totalSales,
      totalDue,
      totalPayments: payments.length,
    };
  }
}
