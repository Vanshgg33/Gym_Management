import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema.js';
import { PettyCash, PettyCashDocument } from './schemas/petty-cash.schema.js';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(PettyCash.name) private pettyCashModel: Model<PettyCashDocument>,
  ) {}

  async findAll(filters: {
    category?: string;
    from?: Date;
    to?: Date;
  }) {
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
    return this.expenseModel.create({ ...data, createdBy: actorId });
  }

  async addPettyCash(data: Partial<PettyCash>) {
    return this.pettyCashModel.create(data);
  }

  async getPettyCashBalance(): Promise<number> {
    const result = await this.pettyCashModel.aggregate([
      { $group: { _id: null, balance: { $sum: '$amountPaise' } } },
    ]);
    return result[0]?.balance ?? 0;
  }

  async getCards() {
    const now = new Date();
    const startOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);

    const expenses = await this.expenseModel
      .find({ date: { $gte: startOfMonth } })
      .select('amountPaise')
      .exec();

    const totalThisMonth = expenses.reduce((sum, e) => sum + ((e as unknown as { amountPaise?: number }).amountPaise ?? 0), 0);
    const pettyCashBalance = await this.getPettyCashBalance();

    return { totalThisMonth, pettyCashBalance, expenseCount: expenses.length };
  }
}
