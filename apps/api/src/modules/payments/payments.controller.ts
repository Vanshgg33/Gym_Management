import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('membership/:membershipId')
  findByMembership(@Param('membershipId') membershipId: string) {
    return this.paymentsService.findByMembershipId(membershipId);
  }

  @Get('member/:memberId')
  findByMember(@Param('memberId') memberId: string) {
    return this.paymentsService.findByMemberId(memberId);
  }

  @Post()
  @Roles('owner', 'manager', 'frontdesk')
  create(@Body() body: Record<string, unknown>) {
    return this.paymentsService.create(body);
  }

  @Delete(':id')
  @Roles('owner', 'manager')
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.delete(id, user.sub);
  }
}
