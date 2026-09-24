import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('checkin')
  checkIn(@Body() body: { memberId: string; [key: string]: unknown }, @CurrentUser() user: JwtPayload) {
    return this.attendanceService.checkIn(body, user.sub);
  }

  @Post('checkout/:memberId')
  checkOut(@Param('memberId') memberId: string, @CurrentUser() user: JwtPayload) {
    return this.attendanceService.checkOut(memberId, user.sub);
  }

  @Get()
  findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('isStaff') isStaff?: string,
  ) {
    return this.attendanceService.findAll({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      isStaff: isStaff !== undefined ? isStaff === 'true' : undefined,
    });
  }

  @Get('today-count')
  async getTodayCount() {
    const count = await this.attendanceService.findTodayCount();
    return { count };
  }

  @Get('currently-in')
  getCurrentlyIn() {
    return this.attendanceService.findCurrentlyIn();
  }

  @Get('member/:memberId')
  findByMember(
    @Param('memberId') memberId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.findByMemberId(
      memberId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Post('manual')
  addManual(@Body() body: Record<string, unknown>, @CurrentUser() user: JwtPayload) {
    return this.attendanceService.addManual(body, user.sub);
  }
}
