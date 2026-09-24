import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ExercisesService } from './exercises.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  findAll(@Query('muscleGroup') muscleGroup?: string) {
    return this.exercisesService.findAll(muscleGroup);
  }

  @Post()
  @Roles('owner', 'manager')
  create(@Body() body: Record<string, unknown>) {
    return this.exercisesService.create(body);
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.exercisesService.search(q);
  }
}
