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
import { FollowupsService } from './followups.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';

@Controller('followups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.followupsService.findAll({
      status,
      assignedTo,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Post()
  create(@Body() body: Record<string, unknown>, @CurrentUser() user: JwtPayload) {
    return this.followupsService.create(body, user.sub);
  }

  @Get(':id')
  findByContact(@Param('id') id: string) {
    return this.followupsService.findByContact(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.followupsService.update(id, body, user.sub);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @Body() body: { closingNote?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.followupsService.complete(id, body.closingNote, user.sub);
  }
}
