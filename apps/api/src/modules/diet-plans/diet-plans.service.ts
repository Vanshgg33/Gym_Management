import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DietPlan, DietPlanDocument } from './schemas/diet-plan.schema.js';

@Injectable()
export class DietPlansService {
  constructor(
    @InjectModel(DietPlan.name) private dietPlanModel: Model<DietPlanDocument>,
  ) {}

  async findTemplates(goal?: string) {
    const query: Record<string, unknown> = { isTemplate: true, isArchived: false };
    if (goal) query.goal = goal;
    return this.dietPlanModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const plan = await this.dietPlanModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Diet plan not found');
    return plan;
  }

  async create(data: Partial<DietPlan>) {
    return this.dietPlanModel.create(data);
  }

  async update(id: string, data: Partial<DietPlan>) {
    const plan = await this.dietPlanModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!plan) throw new NotFoundException('Diet plan not found');
    return plan;
  }

  async archive(id: string) {
    const plan = await this.dietPlanModel
      .findByIdAndUpdate(id, { isArchived: true }, { new: true })
      .exec();
    if (!plan) throw new NotFoundException('Diet plan not found');
    return plan;
  }

  async duplicate(id: string) {
    const source = await this.findById(id);
    const { _id, ...rest } = (source as DietPlanDocument & { _id: unknown }).toObject();
    return this.dietPlanModel.create({ ...rest, name: `${source.name} (Copy)`, createdAt: undefined });
  }

  async assignToMember(templateId: string, memberId: string) {
    const template = await this.findById(templateId);
    const { _id, ...rest } = (template as DietPlanDocument & { _id: unknown }).toObject();
    return this.dietPlanModel.create({
      ...rest,
      isTemplate: false,
      memberId,
      createdAt: undefined,
    });
  }

  async findByMember(memberId: string) {
    return this.dietPlanModel
      .find({ memberId, isTemplate: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async seedTemplates(templates: object[]): Promise<void> {
    const ops = templates.map((t: any) => ({
      updateOne: {
        filter: { name: t.name, isTemplate: true },
        update: { $setOnInsert: t },
        upsert: true,
      },
    }));
    await this.dietPlanModel.bulkWrite(ops);
  }
}
