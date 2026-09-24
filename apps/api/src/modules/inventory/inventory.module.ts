import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service.js';
import { InventoryController } from './inventory.controller.js';
import { Product, ProductSchema } from './schemas/product.schema.js';
import { Supplier, SupplierSchema } from './schemas/supplier.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
