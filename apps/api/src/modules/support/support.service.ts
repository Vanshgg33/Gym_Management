import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema.js';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async findAll(ticketType?: string, status?: string) {
    const query: Record<string, unknown> = {};
    if (ticketType) query.ticketType = ticketType;
    if (status) query.status = status;
    return this.ticketModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async create(data: Partial<Ticket>, actorId?: string) {
    return this.ticketModel.create({ ...data, createdBy: actorId });
  }

  async reply(id: string, authorId: string, authorName: string, body: string) {
    const ticket = await this.ticketModel
      .findByIdAndUpdate(
        id,
        {
          $push: {
            replies: { authorId, authorName, body, createdAt: new Date() },
          },
        },
        { new: true },
      )
      .exec();
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async updateStatus(id: string, status: string) {
    const ticket = await this.ticketModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async getUnreadCount(): Promise<number> {
    return this.ticketModel.countDocuments({ status: 'open', isRead: false });
  }
}
