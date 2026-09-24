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
import { DietPlansService } from './diet-plans.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('diet-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DietPlansController {
  constructor(private readonly dietPlansService: DietPlansService) {}

  @Get()
  findTemplates(@Query('goal') goal?: string) {
    return this.dietPlansService.findTemplates(goal);
  }

  @Post()
  @Roles('owner', 'manager')
  create(@Body() body: Record<string, unknown>) {
    return this.dietPlansService.create(body);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.dietPlansService.findById(id);
  }

  @Patch(':id')
  @Roles('owner', 'manager')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.dietPlansService.update(id, body);
  }

  @Post(':id/archive')
  @Roles('owner', 'manager')
  archive(@Param('id') id: string) {
    return this.dietPlansService.archive(id);
  }

  @Post(':id/duplicate')
  @Roles('owner', 'manager')
  duplicate(@Param('id') id: string) {
    return this.dietPlansService.duplicate(id);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() body: { memberId: string }) {
    return this.dietPlansService.assignToMember(id, body.memberId);
  }
}
