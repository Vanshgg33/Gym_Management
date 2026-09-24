import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassesService } from './classes.service.js';
import { ClassesController } from './classes.controller.js';
import { Class, ClassSchema } from './schemas/class.schema.js';
import { ClassEnrollment, ClassEnrollmentSchema } from './schemas/class-enrollment.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Class.name, schema: ClassSchema },
      { name: ClassEnrollment.name, schema: ClassEnrollmentSchema },
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
