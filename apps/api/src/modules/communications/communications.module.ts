import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunicationsService } from './communications.service.js';
import { CommunicationsController } from './communications.controller.js';
import { MessageLog, MessageLogSchema } from './schemas/message-log.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: MessageLog.name, schema: MessageLogSchema }])],
  controllers: [CommunicationsController],
  providers: [CommunicationsService],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
