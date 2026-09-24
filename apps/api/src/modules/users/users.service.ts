import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(includeArchived = false) {
    const filter = includeArchived ? {} : { isArchived: false };
    return this.userModel.find(filter).select('-__v').exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByPhone(phone: string) {
    return this.userModel.findOne({ phone }).exec();
  }

  async update(id: string, data: Partial<User>) {
    const user = await this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getStaff(includeArchived = false) {
    const filter: Record<string, unknown> = {
      role: { $in: ['manager', 'frontdesk', 'trainer', 'other'] },
    };
    if (!includeArchived) filter.isArchived = false;
    return this.userModel.find(filter).select('-__v').exec();
  }

  async countActiveStaff(): Promise<number> {
    return this.userModel.countDocuments({
      role: { $in: ['manager', 'frontdesk', 'trainer', 'other'] },
      isArchived: false,
    });
  }
}
