import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkoutPlan, WorkoutPlanDocument } from './schemas/workout-plan.schema.js';

@Injectable()
export class WorkoutPlansService {
  constructor(
    @InjectModel(WorkoutPlan.name) private workoutPlanModel: Model<WorkoutPlanDocument>,
  ) {}

  async findTemplates(goal?: string) {
    const query: Record<string, unknown> = { isTemplate: true, isArchived: false };
    if (goal) query.goal = goal;
    return this.workoutPlanModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const plan = await this.workoutPlanModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Workout plan not found');
    return plan;
  }

  async create(data: Partial<WorkoutPlan>) {
    return this.workoutPlanModel.create(data);
  }

  async update(id: string, data: Partial<WorkoutPlan>) {
    const plan = await this.workoutPlanModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!plan) throw new NotFoundException('Workout plan not found');
    return plan;
  }

  async archive(id: string) {
    const plan = await this.workoutPlanModel
      .findByIdAndUpdate(id, { isArchived: true }, { new: true })
      .exec();
    if (!plan) throw new NotFoundException('Workout plan not found');
    return plan;
  }

  async duplicate(id: string) {
    const source = await this.findById(id);
    const { _id, ...rest } = (source as WorkoutPlanDocument & { _id: unknown }).toObject();
    return this.workoutPlanModel.create({ ...rest, name: `${source.name} (Copy)`, createdAt: undefined });
  }

  async assignToMember(templateId: string, memberId: string) {
    const template = await this.findById(templateId);
    const { _id, ...rest } = (template as WorkoutPlanDocument & { _id: unknown }).toObject();
    return this.workoutPlanModel.create({
      ...rest,
      isTemplate: false,
      memberId,
      createdAt: undefined,
    });
  }

  async findByMember(memberId: string) {
    return this.workoutPlanModel
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
    await this.workoutPlanModel.bulkWrite(ops);
  }
}
