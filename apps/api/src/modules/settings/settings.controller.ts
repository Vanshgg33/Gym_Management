import { Controller, Get, Put, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles('owner', 'manager', 'frontdesk', 'trainer')
  get() {
    return this.settingsService.get();
  }

  @Put()
  @Roles('owner')
  put(@Body() body: Record<string, unknown>) {
    return this.settingsService.update(body as any);
  }

  @Patch()
  @Roles('owner', 'manager')
  patch(@Body() body: Record<string, unknown>) {
    return this.settingsService.update(body as any);
  }
}
