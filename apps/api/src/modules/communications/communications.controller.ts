import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CommunicationsService } from './communications.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('communications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'manager')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get('logs')
  findLogs(
    @Query('channel') channel?: string,
    @Query('recipientId') recipientId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.communicationsService.findLogs({
      channel,
      recipientId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Post('send')
  send(
    @Body()
    body: {
      channel: 'sms' | 'email' | 'whatsapp';
      recipientPhone: string;
      recipientName: string;
      message: string;
      recipientId?: string;
      trigger?: string;
      templateName?: string;
    },
  ) {
    return this.communicationsService.send(
      body.channel,
      body.recipientPhone,
      body.recipientName,
      body.message,
      body.recipientId,
      body.trigger,
      body.templateName,
    );
  }
}
