import { NextRequest } from 'next/server';

const API = process.env.API_URL ?? 'http://localhost:3001';

async function proxy(req: NextRequest) {
  const url = new URL(req.url);
  const upstream = await fetch(`${API}${url.pathname}${url.search}`, {
    method: req.method,
    headers: {
      'content-type': req.headers.get('content-type') ?? 'application/json',
      cookie: req.headers.get('cookie') ?? '',
      'accept-encoding': 'identity',
    },
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text(),
  });

  const body = await upstream.arrayBuffer();

  // Copy all upstream headers (including set-cookie) into a fresh Headers object.
  // transfer-encoding is stripped because we've already buffered the body.
  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key !== 'transfer-encoding' && key !== 'content-encoding') headers.append(key, value);
  });

  return new Response(body, { status: upstream.status, headers });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
