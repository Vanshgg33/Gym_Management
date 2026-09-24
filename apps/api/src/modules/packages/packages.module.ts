import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackagesService } from './packages.service.js';
import { PackagesController } from './packages.controller.js';
import { GymPackage, GymPackageSchema } from './schemas/package.schema.js';
import { Discount, DiscountSchema } from './schemas/discount.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GymPackage.name, schema: GymPackageSchema },
      { name: Discount.name, schema: DiscountSchema },
    ]),
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
