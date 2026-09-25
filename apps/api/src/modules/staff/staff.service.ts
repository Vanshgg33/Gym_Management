import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Staff, StaffDocument } from './schemas/staff.schema.js';
import { User, UserDocument } from '../users/schemas/user.schema.js';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(includeArchived = false) {
    const query: Record<string, unknown> = {
      role: { $in: ['manager', 'frontdesk', 'trainer', 'other'] },
    };
    if (!includeArchived) query.isArchived = false;
    const users = await this.userModel.find(query).sort({ createdAt: -1 }).exec();

    // Attach staff profile data if it exists
    const staffProfiles = await this.staffModel
      .find({ userId: { $in: users.map((u) => u._id) } })
      .exec();
    const profileMap = new Map(
      staffProfiles.map((p) => [p.userId.toString(), p]),
    );

    return users.map((u) => ({
      _id: u._id,
      userId: u._id,
      name: u.name,
      phone: u.phone,
      role: u.role,
      email: u.email,
      photoUrl: u.photoUrl,
      joiningDate: u.joiningDate,
      isActive: u.isActive,
      isArchived: u.isArchived,
      staffCode: u.staffCode,
      specialisation: u.specialisation,
      enableSystemAccess: u.enableSystemAccess,
      profile: profileMap.get(u._id.toString()) ?? null,
    }));
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('Staff not found');
    const profile = await this.staffModel.findOne({ userId: user._id }).exec();
    return { ...user.toObject(), profile };
  }

  async create(data: {
    name: string;
    phone: string;
    role: string;
    joiningDate?: string;
    enableSystemAccess?: boolean;
    photoUrl?: string;
    specialisation?: string;
  }) {
    const existing = await this.userModel.findOne({ phone: data.phone }).exec();
    if (existing) {
      throw new ConflictException(`Phone ${data.phone} already registered`);
    }

    const user = await this.userModel.create({
      name: data.name,
      phone: data.phone,
      role: data.role || 'other',
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      enableSystemAccess: data.enableSystemAccess !== false,
      photoUrl: data.photoUrl,
      specialisation: data.specialisation,
      isActive: true,
    });

    const staffProfile = await this.staffModel.create({ userId: user._id });

    return {
      _id: user._id,
      userId: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      joiningDate: user.joiningDate,
      isActive: user.isActive,
      profile: staffProfile,
    };
  }

  async update(id: string, data: Record<string, unknown>) {
    // Update user fields (name, phone, role, specialisation, etc.)
    const user = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!user) throw new NotFoundException('Staff not found');
    return user;
  }

  async archive(id: string) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isArchived: true, isActive: false }, { new: true })
      .exec();
    if (!user) throw new NotFoundException('Staff not found');
    return user;
  }

  async getAttendance(_userId: string, _month: number, _year: number) {
    // ponytail: stub — wire AttendanceModel when needed
    return [];
  }
}
