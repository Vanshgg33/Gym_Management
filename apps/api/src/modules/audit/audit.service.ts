import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema.js';

export interface AuditLogInput {
  actorId?: string;
  actorName?: string;
  action: string;
  targetId?: string | Types.ObjectId;
  targetType?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
  ) {}

  async log(input: AuditLogInput): Promise<void> {
    await this.auditModel.create({
      actorId: input.actorId ? new Types.ObjectId(input.actorId) : undefined,
      actorName: input.actorName,
      action: input.action,
      targetId: input.targetId ? new Types.ObjectId(input.targetId.toString()) : undefined,
      targetType: input.targetType,
      before: input.before,
      after: input.after,
      ip: input.ip,
      createdAt: new Date(),
    });
  }

  async findForTarget(targetId: string, targetType?: string) {
    const filter: Record<string, unknown> = { targetId: new Types.ObjectId(targetId) };
    if (targetType) filter.targetType = targetType;
    return this.auditModel.find(filter).sort({ createdAt: -1 }).limit(200).exec();
  }

  async findAll(filters: {
    targetType?: string;
    action?: string;
    actorId?: string;
    from?: Date;
    to?: Date;
    search?: string;
  }) {
    const query: Record<string, unknown> = {};
    if (filters.targetType) query.targetType = filters.targetType;
    if (filters.action) query.action = { $regex: filters.action, $options: 'i' };
    if (filters.actorId) query.actorId = new Types.ObjectId(filters.actorId);
    if (filters.from || filters.to) {
      query.createdAt = {};
      if (filters.from) (query.createdAt as Record<string, unknown>).$gte = filters.from;
      if (filters.to) (query.createdAt as Record<string, unknown>).$lte = filters.to;
    }
    return this.auditModel.find(query).sort({ createdAt: -1 }).limit(500).exec();
  }
}
