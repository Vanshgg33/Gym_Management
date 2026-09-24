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
import { MembersService } from './members.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @Roles('owner', 'manager', 'frontdesk')
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('gender') gender?: string,
    @Query('isArchived') isArchived?: string,
  ) {
    return this.membersService.findAll({
      search,
      status,
      gender,
      isArchived: isArchived === 'true',
    });
  }

  @Get(':id')
  @Roles('owner', 'manager', 'frontdesk', 'trainer')
  findOne(@Param('id') id: string) {
    return this.membersService.findById(id);
  }

  @Post()
  @Roles('owner', 'manager', 'frontdesk')
  create(@Body() body: Record<string, unknown>, @CurrentUser() user: JwtPayload) {
    return this.membersService.create(body as any, user.sub);
  }

  @Patch(':id')
  @Roles('owner', 'manager', 'frontdesk')
  update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.membersService.update(id, body as any, user.sub);
  }

  @Patch(':id/archive')
  @Roles('owner', 'manager')
  archive(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.membersService.archive(id, user.sub);
  }

  @Patch(':id/restore')
  @Roles('owner', 'manager')
  restore(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.membersService.restore(id, user.sub);
  }
}
