import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise, ExerciseDocument } from './schemas/exercise.schema.js';

export interface ExerciseData {
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
}

@Injectable()
export class ExercisesService {
  constructor(
    @InjectModel(Exercise.name) private exerciseModel: Model<ExerciseDocument>,
  ) {}

  async findAll(muscleGroup?: string) {
    const query: Record<string, unknown> = {};
    if (muscleGroup) query.muscleGroup = muscleGroup;
    return this.exerciseModel.find(query).sort({ name: 1 }).exec();
  }

  async findById(id: string) {
    const exercise = await this.exerciseModel.findById(id).exec();
    if (!exercise) throw new NotFoundException('Exercise not found');
    return exercise;
  }

  async create(data: Partial<Exercise>) {
    return this.exerciseModel.create(data);
  }

  async search(q: string) {
    return this.exerciseModel
      .find({ name: { $regex: q, $options: 'i' } })
      .limit(20)
      .exec();
  }

  async seedExercises(exercises: ExerciseData[]): Promise<void> {
    const ops = exercises.map((e) => ({
      updateOne: {
        filter: { name: e.name },
        update: { $setOnInsert: e },
        upsert: true,
      },
    }));
    await this.exerciseModel.bulkWrite(ops);
  }
}
