import { NextRequest, NextResponse } from 'next/server';
import { signToken, verifyPassword } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminHash) {
    return NextResponse.json({ error: 'Sunucu yapılandırması eksik' }, { status: 500 });
  }

  const { email, password } = await req.json();

  if (email !== adminEmail || !(await verifyPassword(password, adminHash))) {
    return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
  }

  const token = await signToken(email);
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
