import { NextRequest, NextResponse } from 'next/server';
import { getDB, generateId } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json([]);
  const { results } = await db.prepare('SELECT * FROM budgets').all();
  return NextResponse.json(results.map((r: any) => ({ ...r, limit: r.limit_amount })));
}

export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const body = await req.json();
  const id = generateId();
  await db.prepare(
    'INSERT INTO budgets (id, category, limit_amount, period, color) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, body.category, body.limit, body.period ?? 'monthly', body.color).run();
  return NextResponse.json({ id });
}
