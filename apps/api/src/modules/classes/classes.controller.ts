import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ClassesService } from './classes.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Post()
  @Roles('owner', 'manager')
  create(@Body() body: Record<string, unknown>) {
    return this.classesService.create(body);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.classesService.findById(id);
  }

  @Patch(':id')
  @Roles('owner', 'manager')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.classesService.update(id, body);
  }

  @Post(':id/enroll')
  enroll(@Param('id') id: string, @Body() body: { memberId: string }) {
    return this.classesService.enroll(id, body.memberId);
  }

  @Patch('enrollments/:id/approve')
  @Roles('owner', 'manager')
  approveEnrollment(@Param('id') id: string) {
    return this.classesService.approveEnrollment(id);
  }
}
