/**
 * Standalone seed entry point.
 * Run: pnpm ts-node src/seed/seed.ts
 * (NODE_ENV must be 'development' or 'test')
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module.js';
import { SeederModule } from './seeder.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    SeederModule,
  ],
})
class SeedAppModule {}

async function main() {
  process.env.NODE_ENV ??= 'development';
  const app = await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['log', 'warn', 'error'],
  });
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
