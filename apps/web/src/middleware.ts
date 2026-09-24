import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = [
  '/dashboard', '/members', '/packages', '/follow-ups', '/staff',
  '/finance', '/expenses', '/attendance', '/workout-plans', '/diet-plans',
  '/support', '/settings',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !req.cookies.get('access_token')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};
