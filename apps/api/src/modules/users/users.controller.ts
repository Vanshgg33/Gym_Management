import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('staff')
  @Roles('owner', 'manager')
  getStaff(@Query('includeArchived') includeArchived: string) {
    return this.usersService.getStaff(includeArchived === 'true');
  }

  @Get(':id')
  @Roles('owner', 'manager')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
