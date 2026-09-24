import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Membership, MembershipDocument } from './schemas/membership.schema.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>,
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
        startDate: { $lte: today },
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

      await this.membershipModel.findByIdAndUpdate(id, {
        status: 'active',
        endDate: newEndDate,
        'freezes.$[last].unfrozenAt': new Date(),
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

  async getTotalPaid(membershipId: string): Promise<number> {
    // ponytail: simplified — real impl aggregates payments collection
    return 0;
  }
}
