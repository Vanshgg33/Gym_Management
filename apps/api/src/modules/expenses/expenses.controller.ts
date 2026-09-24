import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'manager')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.expensesService.findAll({
      category,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Post()
  create(@Body() body: Record<string, unknown>, @CurrentUser() user: JwtPayload) {
    return this.expensesService.create(body, user.sub);
  }

  @Get('petty-cash/balance')
  getPettyCashBalance() {
    return this.expensesService.getPettyCashBalance();
  }

  @Post('petty-cash')
  addPettyCash(@Body() body: Record<string, unknown>) {
    return this.expensesService.addPettyCash(body);
  }
}
