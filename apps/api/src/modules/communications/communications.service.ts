import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageLog, MessageLogDocument } from './schemas/message-log.schema.js';

@Injectable()
export class CommunicationsService {
  constructor(
    @InjectModel(MessageLog.name) private messageLogModel: Model<MessageLogDocument>,
  ) {}

  async send(
    channel: 'sms' | 'email' | 'whatsapp',
    recipientPhone: string,
    recipientName: string,
    body: string,
    recipientId?: string,
    trigger?: string,
    templateName?: string,
  ) {
    const isPretend = process.env.PRETEND_MODE === 'true';

    if (isPretend) {
      console.log(`[PRETEND ${channel.toUpperCase()}] to=${recipientPhone} name=${recipientName} body=${body}`);
    }

    return this.messageLogModel.create({
      channel,
      recipientPhone,
      recipientName,
      recipientId,
      body,
      trigger,
      templateName,
      isPretend,
      sentAt: new Date(),
    });
  }

  async findLogs(filters: {
    channel?: string;
    recipientId?: string;
    from?: Date;
    to?: Date;
  }) {
    const query: Record<string, unknown> = {};
    if (filters.channel) query.channel = filters.channel;
    if (filters.recipientId) query.recipientId = filters.recipientId;
    if (filters.from || filters.to) {
      query.sentAt = {};
      if (filters.from) (query.sentAt as Record<string, unknown>).$gte = filters.from;
      if (filters.to) (query.sentAt as Record<string, unknown>).$lte = filters.to;
    }
    return this.messageLogModel.find(query).sort({ sentAt: -1 }).limit(500).exec();
  }
}
