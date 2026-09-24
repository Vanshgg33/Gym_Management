import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema.js';
import { PettyCash, PettyCashDocument } from './schemas/petty-cash.schema.js';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(PettyCash.name) private pettyCashModel: Model<PettyCashDocument>,
  ) {}

  async findAll(filters: { category?: string; from?: Date; to?: Date }) {
    const query: Record<string, unknown> = {};
    if (filters.category) query.category = filters.category;
    if (filters.from || filters.to) {
      query.date = {};
      if (filters.from) (query.date as Record<string, unknown>).$gte = filters.from;
      if (filters.to) (query.date as Record<string, unknown>).$lte = filters.to;
    }
    return this.expenseModel.find(query).sort({ date: -1 }).exec();
  }

  async create(data: Partial<Expense>, actorId?: string) {
    return this.expenseModel.create({
      ...data,
      addedById: actorId ? new Types.ObjectId(actorId) : undefined,
    });
  }

  async addPettyCash(data: Partial<PettyCash>, actorId?: string) {
    return this.pettyCashModel.create({
      ...data,
      entryType: 'top_up',
      addedById: actorId ? new Types.ObjectId(actorId) : undefined,
    });
  }

  async getPettyCashBalance(): Promise<{ balance: number }> {
    const topUps = await this.pettyCashModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amountInPaise' } } },
    ]);
    const spent = await this.expenseModel.aggregate([
      { $match: { fromPettyCash: true } },
      { $group: { _id: null, total: { $sum: '$amountInPaise' } } },
    ]);
    const balance = (topUps[0]?.total ?? 0) - (spent[0]?.total ?? 0);
    return { balance: Math.max(0, balance) };
  }

  async getCards() {
    const now = new Date();
    const startOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
    const [expenses, { balance: pettyCashBalance }] = await Promise.all([
      this.expenseModel.find({ date: { $gte: startOfMonth } }).exec(),
      this.getPettyCashBalance(),
    ]);
    const totalThisMonth = expenses.reduce((s, e) => s + (e.amountInPaise ?? 0), 0);
    return { totalThisMonth, pettyCashBalance, expenseCount: expenses.length };
  }
}
