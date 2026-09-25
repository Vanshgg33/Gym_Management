import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Membership, MembershipDocument } from './schemas/membership.schema.js';
import { Member, MemberDocument } from '../members/schemas/member.schema.js';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema.js';
import { Invoice, InvoiceDocument } from '../payments/schemas/invoice.schema.js';
import { AuditService } from '../audit/audit.service.js';

interface SellPackageDto {
  memberId: string;
  packageId: string;
  packageSnapshot: { name: string; type: string; priceInPaise: number; durationDays: number; sessions?: number };
  salePriceInPaise: number;
  startDate: Date;
  endDate: Date;
  trainerId?: string;
  discountId?: string;
  amountPayingInPaise: number;
  paymentEntries: { method: string; amountInPaise: number; txRef?: string }[];
  includeGst: boolean;
  notes?: string;
  actorId: string;
}

@Injectable()
export class MembershipsService {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>,
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private auditService: AuditService,
  ) {}

  async findByMemberId(memberId: string) {
    return this.membershipModel
      .find({ memberId: new Types.ObjectId(memberId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string) {
    const m = await this.membershipModel.findById(id).exec();
    if (!m) throw new NotFoundException('Membership not found');
    return m;
  }

  async findActiveByMemberId(memberId: string): Promise<MembershipDocument | null> {
    const today = new Date();
    return this.membershipModel
      .findOne({
        memberId: new Types.ObjectId(memberId),
        status: { $in: ['active', 'upcoming'] },
        endDate: { $gte: today },
      })
      .exec();
  }

  async create(data: Partial<Membership>, session?: ClientSession) {
    // Auto-set status: upcoming if startDate > today
    const today = new Date();
    if (data.startDate && new Date(data.startDate) > today) {
      data.status = 'upcoming';
    } else {
      data.status = 'active';
    }
    const [membership] = await this.membershipModel.create([data], session ? { session } : {});
    await this.auditService.log({
      action: 'membership.created',
      targetId: membership._id.toString(),
      targetType: 'Membership',
      after: { memberId: data.memberId, packageName: data.packageSnapshot?.name },
    });
    return membership;
  }

  async update(id: string, data: Partial<Membership>, actorId?: string) {
    const before = await this.findById(id);
    // Price can never drop below what was already paid
    if (data.salePriceInPaise !== undefined) {
      const totalPaid = await this.getTotalPaid(id);
      if (data.salePriceInPaise < totalPaid) {
        throw new BadRequestException(
          `Sale price cannot be less than amount already paid (${totalPaid} paise)`,
        );
      }
    }
    const membership = await this.membershipModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!membership) throw new NotFoundException('Membership not found');

    await this.auditService.log({
      actorId,
      action: 'membership.updated',
      targetId: id,
      targetType: 'Membership',
      before: { status: before.status, endDate: before.endDate },
      after: { status: membership.status, endDate: membership.endDate },
    });
    return membership;
  }

  async freeze(
    id: string,
    freezeData: {
      startDate: Date;
      days: number;
      feeInPaise?: number;
      paymentMethod?: string;
    },
    actorId?: string,
  ) {
    const membership = await this.findById(id);

    if (membership.status !== 'active') {
      throw new BadRequestException('Only active memberships can be frozen');
    }

    // Check freeze frequency (once per 6 months unless unlimited)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentFreeze = membership.freezes?.find(
      (f) => new Date(f.startDate) > sixMonthsAgo && !f.unfrozenAt,
    );
    // (unlimited freeze check happens in controller/settings)

    // Push end date by frozen days
    const newEndDate = new Date(membership.endDate);
    newEndDate.setDate(newEndDate.getDate() + freezeData.days);

    const updated = await this.membershipModel
      .findByIdAndUpdate(
        id,
        {
          status: 'frozen',
          endDate: newEndDate,
          $push: { freezes: { ...freezeData, startDate: freezeData.startDate ?? new Date() } },
        },
        { new: true },
      )
      .exec();

    await this.auditService.log({
      actorId,
      action: 'membership.frozen',
      targetId: id,
      targetType: 'Membership',
      after: { days: freezeData.days, newEndDate },
    });
    return updated;
  }

  async unfreeze(id: string, actorId?: string) {
    const membership = await this.findById(id);
    if (membership.status !== 'frozen') {
      throw new BadRequestException('Membership is not frozen');
    }

    // Find latest freeze entry and calculate remaining days
    const lastFreeze = membership.freezes?.[membership.freezes.length - 1];
    if (lastFreeze && !lastFreeze.unfrozenAt) {
      const frozenSince = new Date(lastFreeze.startDate);
      const daysActuallyFrozen = Math.ceil(
        (Date.now() - frozenSince.getTime()) / (1000 * 60 * 60 * 24),
      );
      const remainingDays = lastFreeze.days - daysActuallyFrozen;

      // Pull back end date by remaining unused frozen days
      const newEndDate = new Date(membership.endDate);
      if (remainingDays > 0) {
        newEndDate.setDate(newEndDate.getDate() - remainingDays);
      }

      const lastIdx = membership.freezes.length - 1;
      await this.membershipModel.findByIdAndUpdate(id, {
        $set: {
          status: 'active',
          endDate: newEndDate,
          [`freezes.${lastIdx}.unfrozenAt`]: new Date(),
        },
      });
    } else {
      await this.membershipModel.findByIdAndUpdate(id, { status: 'active' });
    }

    const updated = await this.membershipModel.findById(id).exec();

    await this.auditService.log({
      actorId,
      action: 'membership.unfrozen',
      targetId: id,
      targetType: 'Membership',
    });
    return updated;
  }

  async complete(id: string, adminNote?: string, actorId?: string) {
    const membership = await this.membershipModel
      .findByIdAndUpdate(id, { status: 'completed', adminNote }, { new: true })
      .exec();
    if (!membership) throw new NotFoundException('Membership not found');

    await this.auditService.log({
      actorId,
      action: 'membership.completed',
      targetId: id,
      targetType: 'Membership',
      after: { adminNote },
    });
    return membership;
  }

  async transfer(
    id: string,
    data: { toMemberId: string; relationship: string; transferFeeInPaise?: number },
    actorId?: string,
  ) {
    const source = await this.findById(id);
    if (!['active', 'upcoming'].includes(source.status)) {
      throw new BadRequestException('Only active or upcoming memberships can be transferred');
    }

    const remainingDays = Math.ceil(
      (new Date(source.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (remainingDays <= 0) throw new BadRequestException('Membership has already expired');

    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + remainingDays);

    const newMembership = await this.membershipModel.create({
      memberId: new Types.ObjectId(data.toMemberId),
      packageId: source.packageId,
      packageSnapshot: source.packageSnapshot,
      salePriceInPaise: 0,
      startDate: new Date(),
      endDate: newEndDate,
      status: 'active',
      linkedFrom: source._id,
    });

    await this.membershipModel.findByIdAndUpdate(id, {
      status: 'transferred',
      linkedTo: newMembership._id,
    });

    await this.auditService.log({
      actorId,
      action: 'membership.transferred',
      targetId: id,
      targetType: 'Membership',
      after: { toMemberId: data.toMemberId, newMembershipId: newMembership._id },
    });

    return newMembership;
  }

  async expireOverdue(): Promise<number> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setUTCHours(23, 59, 59, 999);

    const result = await this.membershipModel.updateMany(
      { status: 'active', endDate: { $lte: yesterday } },
      { $set: { status: 'expired' } },
    );
    return result.modifiedCount;
  }

  async activateUpcoming(): Promise<number> {
    const now = new Date();
    const result = await this.membershipModel.updateMany(
      { status: 'upcoming', startDate: { $lte: now } },
      { $set: { status: 'active' } },
    );
    return result.modifiedCount;
  }

  async findExpiredToday() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    return this.membershipModel
      .find({ status: 'active', endDate: { $gte: today, $lt: tomorrow } })
      .exec();
  }

  async findExpiringInDays(days: number) {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + days);
    return this.membershipModel
      .find({ status: 'active', endDate: { $gte: from, $lte: to } })
      .exec();
  }

  async sellPackage(dto: SellPackageDto) {
    const member = await this.memberModel.findById(dto.memberId).exec();
    if (!member) throw new NotFoundException('Member not found');

    // Compare calendar dates in IST — a membership starting "today" is immediately active
    const startDay = new Date(dto.startDate);
    startDay.setUTCHours(0, 0, 0, 0);
    const todayDay = new Date();
    todayDay.setUTCHours(0, 0, 0, 0);
    const status = startDay > todayDay ? 'upcoming' : 'active';

    const membership = await this.membershipModel.create({
      memberId: new Types.ObjectId(dto.memberId),
      packageId: new Types.ObjectId(dto.packageId),
      packageSnapshot: dto.packageSnapshot,
      salePriceInPaise: dto.salePriceInPaise,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status,
      trainerId: dto.trainerId ? new Types.ObjectId(dto.trainerId) : undefined,
      discountId: dto.discountId ? new Types.ObjectId(dto.discountId) : undefined,
      sessionsTotal: dto.packageSnapshot.sessions ?? 0,
    });

    // Generate invoice
    const invoiceNumber = `INV-${Date.now()}`;
    const balanceInPaise = Math.max(0, dto.salePriceInPaise - dto.amountPayingInPaise);
    const invoice = await this.invoiceModel.create({
      invoiceNumber,
      memberId: new Types.ObjectId(dto.memberId),
      membershipId: membership._id,
      salePriceInPaise: dto.salePriceInPaise,
      paidInPaise: dto.amountPayingInPaise,
      balanceInPaise,
      includeGst: dto.includeGst,
      paymentMethods: dto.paymentEntries.map((e) => e.method),
      packageName: dto.packageSnapshot.name,
      memberName: member.name,
    });

    let payment = null;
    if (dto.amountPayingInPaise > 0) {
      payment = await this.paymentModel.create({
        membershipId: membership._id,
        memberId: new Types.ObjectId(dto.memberId),
        entries: dto.paymentEntries,
        totalInPaise: dto.amountPayingInPaise,
        date: new Date(),
        invoiceId: invoice._id,
        notes: dto.notes,
      });
    }

    if (status === 'active') {
      await this.memberModel.findByIdAndUpdate(dto.memberId, { status: 'active' });
    }

    await this.auditService.log({
      actorId: dto.actorId,
      action: 'membership.sold',
      targetId: membership._id.toString(),
      targetType: 'Membership',
      after: { memberId: dto.memberId, packageName: dto.packageSnapshot.name, salePriceInPaise: dto.salePriceInPaise },
    });

    return { membership, invoice, payment };
  }

  async getTotalPaid(membershipId: string): Promise<number> {
    const result = await this.paymentModel.aggregate([
      { $match: { membershipId: new Types.ObjectId(membershipId), isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$totalInPaise' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async getDues(): Promise<{
    dueToday: unknown[];
    dueTo14Days: unknown[];
    due15Plus: unknown[];
    totalCount: number;
  }> {
    // Get all active memberships that have outstanding balance
    const activeMemberships = await this.membershipModel
      .find({ status: 'active' })
      .populate('memberId', 'name phone code')
      .exec();

    const now = new Date();
    const results: { membership: unknown; member: unknown; dueInPaise: number; daysOverdue: number }[] = [];

    for (const m of activeMemberships) {
      const paid = await this.getTotalPaid(m._id.toString());
      const due = m.salePriceInPaise - paid;
      if (due <= 0) continue;

      const daysOverdue = Math.floor(
        (now.getTime() - new Date(m.startDate).getTime()) / (1000 * 60 * 60 * 24),
      );

      results.push({ membership: m, member: m.memberId, dueInPaise: due, daysOverdue });
    }

    return {
      dueToday: results.filter((r) => r.daysOverdue === 0),
      dueTo14Days: results.filter((r) => r.daysOverdue >= 1 && r.daysOverdue <= 14),
      due15Plus: results.filter((r) => r.daysOverdue > 14),
      totalCount: results.length,
    };
  }
}
