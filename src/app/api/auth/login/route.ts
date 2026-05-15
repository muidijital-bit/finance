import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  const newHex = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return newHex === hashHex;
}

export async function POST(req: NextRequest) {
  let env: Record<string, string>;
  try {
    env = getRequestContext().env as Record<string, string>;
  } catch {
    env = process.env as Record<string, string>;
  }

  const adminEmail = env.ADMIN_EMAIL;
  const adminHash = env.ADMIN_PASSWORD_HASH;
  const jwtSecret = env.JWT_SECRET ?? 'dev-secret-change-me';

  if (!adminEmail || !adminHash) {
    return NextResponse.json({ error: 'Sunucu yapılandırması eksik' }, { status: 500 });
  }

  const { email, password } = await req.json();

  if (email !== adminEmail || !(await verifyPassword(password, adminHash))) {
    return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
  }

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(jwtSecret));

  const res = NextResponse.json({ ok: true });
  res.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
