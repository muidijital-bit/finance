import { NextRequest, NextResponse } from 'next/server';
import { getDB, generateId } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json([]);
  const { results } = await db.prepare('SELECT * FROM payment_schedules').all();
  return NextResponse.json(results.map((r: any) => ({
    ...r,
    dueDay: r.due_day,
    isActive: r.is_active === 1,
    paymentCategory: r.payment_category ?? undefined,
  })));
}

export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const body = await req.json();
  const id = generateId();
  await db.prepare(
    'INSERT INTO payment_schedules (id, title, amount, currency, due_day, type, category, payment_category, is_active, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.title, body.amount, body.currency ?? 'TRY', body.dueDay, body.type, body.category,
    body.paymentCategory ?? null, body.isActive ? 1 : 0, body.note ?? null).run();
  return NextResponse.json({ id });
}
