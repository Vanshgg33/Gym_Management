import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FollowUp, FollowUpDocument } from './schemas/followup.schema.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class FollowupsService {
  constructor(
    @InjectModel(FollowUp.name) private followUpModel: Model<FollowUpDocument>,
    private auditService: AuditService,
  ) {}

  async findAll(filters: {
    status?: string;
    assignedTo?: string;
    from?: Date;
    to?: Date;
  }) {
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.from || filters.to) {
      query.scheduledAt = {};
      if (filters.from) (query.scheduledAt as Record<string, unknown>).$gte = filters.from;
      if (filters.to) (query.scheduledAt as Record<string, unknown>).$lte = filters.to;
    }
    return this.followUpModel.find(query).sort({ scheduledAt: 1 }).exec();
  }

  async findByContact(contactId: string) {
    return this.followUpModel.find({ contactId }).sort({ createdAt: -1 }).exec();
  }

  async create(data: Partial<FollowUp>, actorId?: string) {
    const followUp = await this.followUpModel.create({ ...data, createdBy: actorId });

    await this.auditService.log({
      actorId,
      action: 'followup.created',
      targetId: followUp._id.toString(),
      targetType: 'FollowUp',
    });

    return followUp;
  }

  async complete(id: string, closingNote?: string, actorId?: string) {
    const followUp = await this.followUpModel
      .findByIdAndUpdate(
        id,
        { status: 'completed', closingNote, completedAt: new Date(), completedBy: actorId },
        { new: true },
      )
      .exec();
    if (!followUp) throw new NotFoundException('Follow-up not found');

    await this.auditService.log({
      actorId,
      action: 'followup.completed',
      targetId: id,
      targetType: 'FollowUp',
      after: { closingNote },
    });

    return followUp;
  }

  async update(id: string, data: Partial<FollowUp>, actorId?: string) {
    const followUp = await this.followUpModel
      .findByIdAndUpdate(id, { ...data, updatedBy: actorId }, { new: true })
      .exec();
    if (!followUp) throw new NotFoundException('Follow-up not found');
    return followUp;
  }
}
