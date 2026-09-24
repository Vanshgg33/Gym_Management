import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkoutPlansService } from './workout-plans.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('workout-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkoutPlansController {
  constructor(private readonly workoutPlansService: WorkoutPlansService) {}

  @Get()
  findTemplates(@Query('goal') goal?: string) {
    return this.workoutPlansService.findTemplates(goal);
  }

  @Post()
  @Roles('owner', 'manager')
  create(@Body() body: Record<string, unknown>) {
    return this.workoutPlansService.create(body);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.workoutPlansService.findById(id);
  }

  @Patch(':id')
  @Roles('owner', 'manager')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.workoutPlansService.update(id, body);
  }

  @Post(':id/archive')
  @Roles('owner', 'manager')
  archive(@Param('id') id: string) {
    return this.workoutPlansService.archive(id);
  }

  @Post(':id/duplicate')
  @Roles('owner', 'manager')
  duplicate(@Param('id') id: string) {
    return this.workoutPlansService.duplicate(id);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() body: { memberId: string }) {
    return this.workoutPlansService.assignToMember(id, body.memberId);
  }
}
