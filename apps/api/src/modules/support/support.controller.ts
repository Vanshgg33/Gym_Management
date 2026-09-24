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
import { SupportService } from './support.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  findAll(@Query('ticketType') ticketType?: string, @Query('status') status?: string) {
    return this.supportService.findAll(ticketType, status);
  }

  @Post('tickets')
  create(@Body() body: Record<string, unknown>, @CurrentUser() user: JwtPayload) {
    return this.supportService.create(body, user.sub);
  }

  @Get('tickets/:id')
  findById(@Param('id') id: string) {
    return this.supportService.findById(id);
  }

  @Patch('tickets/:id')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.supportService.updateStatus(id, body.status);
  }

  @Post('tickets/:id/reply')
  reply(
    @Param('id') id: string,
    @Body() body: { body: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.supportService.reply(id, user.sub, user.name ?? '', body.body);
  }
}
