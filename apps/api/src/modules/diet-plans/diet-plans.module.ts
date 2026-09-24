import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DietPlansService } from './diet-plans.service.js';
import { DietPlansController } from './diet-plans.controller.js';
import { DietPlan, DietPlanSchema } from './schemas/diet-plan.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: DietPlan.name, schema: DietPlanSchema }])],
  controllers: [DietPlansController],
  providers: [DietPlansService],
  exports: [DietPlansService],
})
export class DietPlansModule {}
