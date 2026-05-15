import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const body = await req.json();
  await db.prepare(
    'UPDATE investments SET name=?, symbol=?, type=?, quantity=?, buy_price=?, current_price=?, interest_rate=?, maturity_date=?, currency=?, date=? WHERE id=?'
  ).bind(body.name, body.symbol, body.type, body.quantity, body.buyPrice, body.currentPrice, body.interestRate ?? null, body.maturityDate ?? null, body.currency, body.date, params.id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  await db.prepare('DELETE FROM investments WHERE id=?').bind(params.id).run();
  return NextResponse.json({ ok: true });
}
