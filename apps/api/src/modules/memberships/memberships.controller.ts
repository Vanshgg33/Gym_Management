import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';

@Controller('memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'manager')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get('member/:memberId')
  findByMember(@Param('memberId') memberId: string) {
    return this.membershipsService.findByMemberId(memberId);
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.membershipsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.membershipsService.update(id, body);
  }

  @Post(':id/freeze')
  freeze(
    @Param('id') id: string,
    @Body() body: { startDate: string; days: number; feeInPaise?: number; paymentMethod?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.membershipsService.freeze(
      id,
      { ...body, startDate: new Date(body.startDate) },
      user.sub,
    );
  }

  @Post(':id/unfreeze')
  unfreeze(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.membershipsService.unfreeze(id, user.sub);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @Body() body: { adminNote?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.membershipsService.complete(id, body.adminNote, user.sub);
  }

  @Post('sell')
  sell(@Body() body: Record<string, unknown>, @CurrentUser() user: JwtPayload) {
    return this.membershipsService.sellPackage({ ...(body as any), actorId: user.sub });
  }
}
