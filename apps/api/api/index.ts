import type { IncomingMessage, ServerResponse } from 'node:http';

type Handler = (req: IncomingMessage, res: ServerResponse) => void;
let handler: Handler | null = null;

async function bootstrap(): Promise<Handler> {
  if (handler) return handler;
  // dist/main.js is the webpack CJS bundle — all @nestjs/* ESM resolved by webpack
  const { createApp } = await import('../dist/main.js');
  handler = await createApp();
  return handler;
}

export default async (req: IncomingMessage, res: ServerResponse) => {
  const origin = process.env.FRONTEND_URL ?? '';

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.statusCode = 204;
    res.end();
    return;
  }

  const h = await bootstrap();
  h(req, res);
};
