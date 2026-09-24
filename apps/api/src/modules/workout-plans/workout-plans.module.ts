import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutPlansService } from './workout-plans.service.js';
import { WorkoutPlansController } from './workout-plans.controller.js';
import { WorkoutPlan, WorkoutPlanSchema } from './schemas/workout-plan.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: WorkoutPlan.name, schema: WorkoutPlanSchema }])],
  controllers: [WorkoutPlansController],
  providers: [WorkoutPlansService],
  exports: [WorkoutPlansService],
})
export class WorkoutPlansModule {}
