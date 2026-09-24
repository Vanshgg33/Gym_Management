import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema.js';
import { MembershipsService } from '../memberships/memberships.service.js';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    private membershipsService: MembershipsService,
  ) {}

  async checkIn(data: {
    memberId: string;
    checkIn?: Date;
    checkOut?: Date;
    source?: string;
    notes?: string;
  }, _actorId?: string) {
    const activeMembership = await this.membershipsService.findActiveByMemberId(data.memberId);
    if (!activeMembership) {
      throw new BadRequestException('No active membership found for this member');
    }
    if (activeMembership.status === 'frozen') {
      throw new BadRequestException('Member membership is frozen');
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const existing = await this.attendanceModel
      .findOne({ memberId: new Types.ObjectId(data.memberId), checkIn: { $gte: today, $lt: tomorrow } })
      .exec();
    if (existing) {
      throw new BadRequestException('Member already checked in today');
    }

    return this.attendanceModel.create({
      memberId: new Types.ObjectId(data.memberId),
      checkIn: data.checkIn ?? new Date(),
      checkOut: data.checkOut,
      source: data.source ?? 'manual',
      notes: data.notes,
    });
  }

  async checkOut(memberId: string, _actorId?: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const record = await this.attendanceModel
      .findOne({
        memberId: new Types.ObjectId(memberId),
        checkIn: { $gte: today, $lt: tomorrow },
        checkOut: null,
      })
      .exec();
    if (!record) throw new NotFoundException('No open check-in found for today');

    record.checkOut = new Date();
    return record.save();
  }

  async findByMemberId(memberId: string, from?: Date, to?: Date) {
    const query: Record<string, unknown> = { memberId: new Types.ObjectId(memberId) };
    if (from || to) {
      query.checkIn = {};
      if (from) (query.checkIn as Record<string, unknown>).$gte = from;
      if (to) (query.checkIn as Record<string, unknown>).$lte = to;
    }
    return this.attendanceModel.find(query).sort({ checkIn: -1 }).exec();
  }

  async findTodayCount(): Promise<number> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    return this.attendanceModel.countDocuments({ checkIn: { $gte: today, $lt: tomorrow } });
  }

  async findCurrentlyIn() {
    return this.attendanceModel.find({ checkOut: null }).sort({ checkIn: -1 }).exec();
  }

  async addManual(data: Record<string, unknown>, _actorId?: string) {
    return this.attendanceModel.create({ ...data, isEdited: true });
  }

  async autoCheckout(maxMinutes: number): Promise<number> {
    const cutoff = new Date(Date.now() - maxMinutes * 60 * 1000);
    const result = await this.attendanceModel.updateMany(
      { checkOut: null, checkIn: { $lt: cutoff }, isStaff: { $ne: true } },
      { $set: { checkOut: new Date() } },
    );
    return result.modifiedCount;
  }

  async findAll(filters: { from?: Date; to?: Date; search?: string; isStaff?: boolean }) {
    const query: Record<string, unknown> = {};
    if (filters.isStaff !== undefined) query.isStaff = filters.isStaff;
    if (filters.from || filters.to) {
      query.checkIn = {};
      if (filters.from) (query.checkIn as Record<string, unknown>).$gte = filters.from;
      if (filters.to) (query.checkIn as Record<string, unknown>).$lte = filters.to;
    }
    return this.attendanceModel.find(query).sort({ checkIn: -1 }).limit(500).exec();
  }
}
