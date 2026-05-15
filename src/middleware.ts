import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC = ['/login', '/api/auth/login'];

function getSecret(req: NextRequest): Uint8Array {
  const secret = (req as any).cf?.env?.JWT_SECRET ?? process.env.JWT_SECRET ?? 'dev-secret-change-me';
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  if (PUBLIC.some((p) => req.nextUrl.pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me');
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png).*)'] };
