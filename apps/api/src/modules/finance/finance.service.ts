import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema.js';
import { Membership, MembershipDocument } from '../memberships/schemas/membership.schema.js';
import { Member, MemberDocument } from '../members/schemas/member.schema.js';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>,
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
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
    const [revenueByMonth, memberGrowth] = await Promise.all([
      this.paymentModel.aggregate([
        { $match: { date: { $gte: from, $lte: to }, isDeleted: false } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$totalInPaise' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      this.memberModel.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);
    return { revenueByMonth, memberGrowth, paymentMethods: [], revByPackage: [] };
  }

  async getCards(from: Date, to: Date) {
    const [payments, memberCount, membershipCount] = await Promise.all([
      this.paymentModel.find({ date: { $gte: from, $lte: to }, isDeleted: false }).exec(),
      this.memberModel.countDocuments({ isArchived: false, status: { $in: ['active', 'pending'] } }),
      this.membershipModel.find({ status: 'active' }).exec(),
    ]);
    const revenueCollected = payments.reduce((s, p) => s + (p.totalInPaise ?? 0), 0);
    const totalSales = membershipCount.reduce((s, m) => s + (m.salePriceInPaise ?? 0), 0);
    const totalPaid = payments.reduce((s, p) => s + (p.totalInPaise ?? 0), 0);
    const totalDue = totalSales - totalPaid;
    return {
      revenueCollected,
      totalSales,
      totalDue: Math.max(0, totalDue),
      totalPayments: payments.length,
      memberCount,
    };
  }

  async getDashboardStats() {
    const activeMembers = await this.memberModel.countDocuments({ status: 'active', isArchived: false });
    return {
      activeMembers,
      todayCheckins: 0,   // ponytail: stub — wire attendance model when needed
      currentlyIn: 0,     // ponytail: stub
      pendingDues: 0,     // ponytail: stub — count memberships with balance > 0 via invoice aggregation
    };
  }
}
