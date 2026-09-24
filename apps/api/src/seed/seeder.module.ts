import { Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ExercisesModule } from '../modules/exercises/exercises.module.js';
import { ExercisesService } from '../modules/exercises/exercises.service.js';
import { WorkoutPlansModule } from '../modules/workout-plans/workout-plans.module.js';
import { WorkoutPlansService } from '../modules/workout-plans/workout-plans.service.js';
import { DietPlansModule } from '../modules/diet-plans/diet-plans.module.js';
import { DietPlansService } from '../modules/diet-plans/diet-plans.service.js';
import { SettingsModule } from '../modules/settings/settings.module.js';
import { SettingsService } from '../modules/settings/settings.service.js';
import { EXERCISES } from './data/exercises.data.js';
import { WORKOUT_TEMPLATES } from './data/workout-templates.data.js';
import { DIET_TEMPLATES } from './data/diet-templates.data.js';

@Module({
  imports: [ExercisesModule, WorkoutPlansModule, DietPlansModule, SettingsModule],
})
export class SeederModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederModule.name);

  constructor(
    private readonly exercisesService: ExercisesService,
    private readonly workoutPlansService: WorkoutPlansService,
    private readonly dietPlansService: DietPlansService,
    private readonly settingsService: SettingsService,
  ) {}

  async onApplicationBootstrap() {
    const env = process.env.NODE_ENV;
    if (env !== 'development' && env !== 'test') return;

    this.logger.log('Running seed...');

    await Promise.all([
      this.exercisesService.seedExercises(EXERCISES),
      this.workoutPlansService.seedTemplates(WORKOUT_TEMPLATES),
      this.dietPlansService.seedTemplates(DIET_TEMPLATES),
      this.settingsService.seedDefaultSettings(),
    ]);

    this.logger.log('Seed done');
  }
}
