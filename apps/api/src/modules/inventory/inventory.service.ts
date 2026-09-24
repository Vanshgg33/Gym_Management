import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema.js';
import { Supplier, SupplierDocument } from './schemas/supplier.schema.js';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
  ) {}

  async findAll(filters: { category?: string; lowStock?: boolean }) {
    const query: Record<string, unknown> = {};
    if (filters.category) query.category = filters.category;
    if (filters.lowStock) query.$expr = { $lte: ['$stockQuantity', '$reorderLevel'] };
    return this.productModel.find(query).sort({ name: 1 }).exec();
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: Partial<Product>) {
    return this.productModel.create(data);
  }

  async update(id: string, data: Partial<Product>) {
    const product = await this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async adjustStock(id: string, delta: number, reason?: string) {
    const product = await this.productModel
      .findByIdAndUpdate(
        id,
        { $inc: { stockQuantity: delta }, $push: { stockHistory: { delta, reason, at: new Date() } } },
        { new: true },
      )
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findAllSuppliers() {
    return this.supplierModel.find().sort({ name: 1 }).exec();
  }

  async createSupplier(data: Partial<Supplier>) {
    return this.supplierModel.create(data);
  }

  async getCards() {
    const totalProducts = await this.productModel.countDocuments();
    const lowStock = await this.productModel.countDocuments({
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
    });
    return { totalProducts, lowStock };
  }
}
