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
import { InventoryService } from './inventory.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'manager')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  findAll(@Query('category') category?: string, @Query('lowStock') lowStock?: string) {
    return this.inventoryService.findAll({ category, lowStock: lowStock === 'true' });
  }

  @Post('products')
  create(@Body() body: Record<string, unknown>) {
    return this.inventoryService.create(body);
  }

  @Get('products/:id')
  findById(@Param('id') id: string) {
    return this.inventoryService.findById(id);
  }

  @Patch('products/:id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.inventoryService.update(id, body);
  }

  @Post('products/:id/stock')
  adjustStock(
    @Param('id') id: string,
    @Body() body: { delta: number; reason?: string },
  ) {
    return this.inventoryService.adjustStock(id, body.delta, body.reason);
  }

  @Get('suppliers')
  findAllSuppliers() {
    return this.inventoryService.findAllSuppliers();
  }

  @Post('suppliers')
  createSupplier(@Body() body: Record<string, unknown>) {
    return this.inventoryService.createSupplier(body);
  }
}
