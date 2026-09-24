import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member, MemberDocument } from './schemas/member.schema.js';
import { SettingsService } from '../settings/settings.service.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    private settingsService: SettingsService,
    private auditService: AuditService,
  ) {}

  async findAll(filters: {
    search?: string;
    type?: string;
    status?: string;
    gender?: string;
    isArchived?: boolean;
    from?: Date;
    to?: Date;
  }) {
    const query: Record<string, unknown> = {};
    if (!filters.isArchived) query.isArchived = false;

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.gender && filters.gender !== 'all') query.gender = filters.gender;
    if (filters.status && filters.status !== 'all') query.status = filters.status;

    return this.memberModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const member = await this.memberModel.findById(id).exec();
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async findByPhone(phone: string) {
    return this.memberModel.findOne({ phone }).exec();
  }

  async create(data: Partial<Member>, actorId?: string) {
    const settings = await this.settingsService.get();

    if (!settings.memberIdPrefix) {
      throw new BadRequestException(
        'Member ID prefix not set. Please configure it in Settings > General first.',
      );
    }

    // Check duplicate phone
    const existing = await this.memberModel.findOne({ phone: data.phone }).exec();
    if (existing) {
      throw new ConflictException({
        message: 'Phone number already registered',
        existingId: existing._id.toString(),
      });
    }

    const code = await this.settingsService.nextMemberCode();
    const member = await this.memberModel.create({ ...data, code });

    await this.auditService.log({
      actorId,
      action: 'member.created',
      targetId: member._id.toString(),
      targetType: 'Member',
      after: { name: member.name, phone: member.phone, code: member.code },
    });

    return member;
  }

  async update(id: string, data: Partial<Member>, actorId?: string) {
    const before = await this.findById(id);
    const member = await this.memberModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!member) throw new NotFoundException('Member not found');

    await this.auditService.log({
      actorId,
      action: 'member.updated',
      targetId: id,
      targetType: 'Member',
      before: { name: before.name, phone: before.phone },
      after: { name: member.name, phone: member.phone },
    });

    return member;
  }

  async archive(id: string, actorId?: string) {
    const member = await this.memberModel
      .findByIdAndUpdate(id, { isArchived: true }, { new: true })
      .exec();
    if (!member) throw new NotFoundException('Member not found');

    await this.auditService.log({
      actorId,
      action: 'member.archived',
      targetId: id,
      targetType: 'Member',
    });

    return member;
  }

  async restore(id: string, actorId?: string) {
    const member = await this.memberModel
      .findByIdAndUpdate(id, { isArchived: false }, { new: true })
      .exec();
    if (!member) throw new NotFoundException('Member not found');

    await this.auditService.log({
      actorId,
      action: 'member.restored',
      targetId: id,
      targetType: 'Member',
    });

    return member;
  }

  async countActive(): Promise<number> {
    return this.memberModel.countDocuments({
      isArchived: false,
      status: { $ne: 'archived' },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.memberModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }

  async getMembersWithDues() {
    // Members with active memberships that have balance > 0
    // This is a simplified version — real impl joins with payments
    return this.memberModel
      .find({ isArchived: false, status: 'active' })
      .select('name phone code')
      .exec();
  }
}
