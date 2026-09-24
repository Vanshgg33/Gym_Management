import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'manager')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('revenue')
  getRevenue(@Query('from') from: string, @Query('to') to: string) {
    return this.financeService.getRevenueData(new Date(from), new Date(to));
  }

  @Get('sales')
  getSales(@Query('from') from: string, @Query('to') to: string) {
    return this.financeService.getSalesData(new Date(from), new Date(to));
  }

  @Get('charts')
  getCharts(@Query('from') from: string, @Query('to') to: string) {
    return this.financeService.getChartData(new Date(from), new Date(to));
  }

  @Get('cards')
  getCards(@Query('from') from: string, @Query('to') to: string) {
    return this.financeService.getCards(new Date(from), new Date(to));
  }
}
