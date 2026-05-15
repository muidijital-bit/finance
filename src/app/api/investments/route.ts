import { NextRequest, NextResponse } from 'next/server';
import { getDB, generateId } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json([]);
  const { results } = await db.prepare('SELECT * FROM investments ORDER BY date DESC').all();
  return NextResponse.json(results.map((r: any) => ({
    ...r,
    buyPrice: r.buy_price,
    currentPrice: r.current_price,
    interestRate: r.interest_rate,
    maturityDate: r.maturity_date,
  })));
}

export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const body = await req.json();
  const id = generateId();
  await db.prepare(
    'INSERT INTO investments (id, name, symbol, type, quantity, buy_price, current_price, interest_rate, maturity_date, currency, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.name, body.symbol, body.type, body.quantity, body.buyPrice, body.currentPrice, body.interestRate ?? null, body.maturityDate ?? null, body.currency, body.date).run();
  return NextResponse.json({ id });
}
