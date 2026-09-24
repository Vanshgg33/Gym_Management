import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, collection: 'inventory_products' })
export class Product {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({
    enum: ['Supplement', 'Apparel', 'Accessory', 'Equipment', 'Beverage', 'Other'],
    default: 'Other',
  })
  category: string;

  @Prop({ enum: ['piece', 'kg', 'g', 'litre', 'ml', 'serving', 'box', 'pack'], default: 'piece' })
  unit: string;

  @Prop({ required: true, type: Number })
  sellingPriceInPaise: number;

  @Prop({ type: Number, default: 0 })
  currentStock: number;

  @Prop({ type: Number, default: 5 })
  lowStockAlert: number;

  @Prop({ type: Types.ObjectId, ref: 'Supplier' })
  supplierId: Types.ObjectId;

  @Prop()
  expiryDate: Date;

  @Prop()
  brand: string;

  @Prop()
  description: string;

  @Prop()
  photoUrl: string;

  @Prop()
  sku: string;

  @Prop()
  barcode: string;

  @Prop({ default: false })
  isArchived: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: 'text', sku: 'text', brand: 'text' });
