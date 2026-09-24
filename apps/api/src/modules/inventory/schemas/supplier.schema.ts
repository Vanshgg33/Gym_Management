import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true, collection: 'inventory_suppliers' })
export class Supplier {
  @Prop({ required: true })
  name: string;

  @Prop()
  contactPerson: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  gstNumber: string;

  @Prop()
  address: string;

  @Prop()
  notes: string;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
