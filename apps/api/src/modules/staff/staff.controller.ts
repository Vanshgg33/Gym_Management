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
import { StaffService } from './staff.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  findAll(@Query('includeArchived') includeArchived?: string) {
    return this.staffService.findAll(includeArchived === 'true');
  }

  @Post()
  create(@Body() body: { user: Record<string, unknown>; staff: Record<string, unknown> }) {
    return this.staffService.create(body.user, body.staff);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.staffService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.staffService.update(id, body);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.staffService.archive(id);
  }
}
