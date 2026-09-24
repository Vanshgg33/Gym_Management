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
import { PackagesService } from './packages.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';

@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  findAll(@Query('type') type?: string, @Query('isArchived') isArchived?: string) {
    return this.packagesService.findAll(type, isArchived === 'true');
  }

  @Get('discounts')
  findAllDiscounts() {
    return this.packagesService.findAllDiscounts();
  }

  @Post('discounts')
  @Roles('owner')
  createDiscount(@Body() body: Record<string, unknown>) {
    return this.packagesService.createDiscount(body);
  }

  @Patch('discounts/:id')
  @Roles('owner')
  updateDiscount(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.packagesService.updateDiscount(id, body);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.packagesService.findById(id);
  }

  @Post()
  @Roles('owner')
  create(@Body() body: Record<string, unknown>, @CurrentUser() user: JwtPayload) {
    return this.packagesService.create(body, user.sub);
  }

  @Patch(':id')
  @Roles('owner')
  update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.packagesService.update(id, body, user.sub);
  }

  @Patch(':id/archive')
  @Roles('owner')
  archive(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.packagesService.archive(id, user.sub);
  }
}
