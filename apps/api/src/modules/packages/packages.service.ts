import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GymPackage, GymPackageDocument } from './schemas/package.schema.js';
import { Discount, DiscountDocument } from './schemas/discount.schema.js';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(GymPackage.name) private packageModel: Model<GymPackageDocument>,
    @InjectModel(Discount.name) private discountModel: Model<DiscountDocument>,
  ) {}

  async findAll(type?: string, isArchived = false) {
    const query: Record<string, unknown> = { isArchived };
    if (type) query.type = type;
    return this.packageModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const pkg = await this.packageModel.findById(id).exec();
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async create(data: Partial<GymPackage>, actorId?: string) {
    return this.packageModel.create({ ...data, createdBy: actorId });
  }

  async update(id: string, data: Partial<GymPackage>, actorId?: string) {
    const pkg = await this.packageModel
      .findByIdAndUpdate(id, { ...data, updatedBy: actorId }, { new: true })
      .exec();
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async archive(id: string, actorId?: string) {
    const pkg = await this.packageModel
      .findByIdAndUpdate(id, { isArchived: true, updatedBy: actorId }, { new: true })
      .exec();
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async findAllDiscounts() {
    return this.discountModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async createDiscount(data: Partial<Discount>) {
    return this.discountModel.create(data);
  }

  async updateDiscount(id: string, data: Partial<Discount>) {
    const discount = await this.discountModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!discount) throw new NotFoundException('Discount not found');
    return discount;
  }
}
