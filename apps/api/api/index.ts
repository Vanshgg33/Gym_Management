import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from '../src/app.module.js';
import type { IncomingMessage, ServerResponse } from 'node:http';

type Handler = (req: IncomingMessage, res: ServerResponse) => void;
let handler: Handler | null = null;

async function bootstrap(): Promise<Handler> {
  if (handler) return handler;
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(cookieParser());
  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' }));
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.setGlobalPrefix('api');
  await app.init();
  handler = app.getHttpAdapter().getInstance() as Handler;
  return handler;
}

export default async (req: IncomingMessage, res: ServerResponse) => {
  const h = await bootstrap();
  h(req, res);
};
