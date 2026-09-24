import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembersController } from './members.controller.js';
import { MembersService } from './members.service.js';
import { Member, MemberSchema } from './schemas/member.schema.js';
import { SettingsModule } from '../settings/settings.module.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
    SettingsModule,
    AuditModule,
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService, MongooseModule],
})
export class MembersModule {}
