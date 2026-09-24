import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Staff, StaffDocument } from './schemas/staff.schema.js';
import { User, UserDocument } from '../users/schemas/user.schema.js';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(includeArchived = false) {
    const query = includeArchived ? {} : { isArchived: false };
    return this.staffModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(userId: string) {
    const staff = await this.staffModel.findOne({ userId }).exec();
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async create(userData: Partial<User>, staffData: Partial<Staff>) {
    const user = await this.userModel.create(userData);
    const staff = await this.staffModel.create({ ...staffData, userId: user._id });
    return { user, staff };
  }

  async update(id: string, data: Partial<Staff>) {
    const staff = await this.staffModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async archive(id: string) {
    const staff = await this.staffModel
      .findByIdAndUpdate(id, { isArchived: true }, { new: true })
      .exec();
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  // ponytail: stub — real impl queries attendance records filtered by userId, month, year
  async getAttendance(userId: string, month: number, year: number) {
    return [];
  }
}
