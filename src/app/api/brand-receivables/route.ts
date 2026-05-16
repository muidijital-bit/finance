import { NextRequest, NextResponse } from 'next/server';
import { getDB, generateId } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json([]);
  const brand = new URL(req.url).searchParams.get('brand');
  const query = brand
    ? db.prepare('SELECT * FROM brand_receivables WHERE brand=? ORDER BY month DESC').bind(brand)
    : db.prepare('SELECT * FROM brand_receivables ORDER BY month DESC');
  const { results } = await query.all();
  return NextResponse.json(results.map((r: any) => ({
    id: r.id,
    brand: r.brand,
    month: r.month,
    fixedAmount: r.fixed_amount ?? 0,
    extraAmount: r.extra_amount ?? 0,
    currency: r.currency ?? 'TRY',
    note: r.note ?? '',
  })));
}

export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const b = await req.json();
  const id = generateId();
  await db.prepare(
    'INSERT INTO brand_receivables (id, brand, month, fixed_amount, extra_amount, currency, note) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, b.brand, b.month, b.fixedAmount ?? 0, b.extraAmount ?? 0, b.currency ?? 'TRY', b.note ?? '').run();
  return NextResponse.json({ id });
}
