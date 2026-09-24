import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from './schemas/class.schema.js';
import { ClassEnrollment, ClassEnrollmentDocument } from './schemas/class-enrollment.schema.js';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(ClassEnrollment.name) private enrollmentModel: Model<ClassEnrollmentDocument>,
  ) {}

  async findAll() {
    return this.classModel.find({ isArchived: false }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const cls = await this.classModel.findById(id).exec();
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  async create(data: Partial<Class>) {
    return this.classModel.create(data);
  }

  async update(id: string, data: Partial<Class>) {
    const cls = await this.classModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  async enroll(classId: string, memberId: string) {
    return this.enrollmentModel.create({ classId, memberId, status: 'pending' });
  }

  async approveEnrollment(enrollmentId: string) {
    const enrollment = await this.enrollmentModel
      .findByIdAndUpdate(enrollmentId, { status: 'approved' }, { new: true })
      .exec();
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  async getEnrollments(classId: string) {
    return this.enrollmentModel.find({ classId }).sort({ createdAt: -1 }).exec();
  }
}
