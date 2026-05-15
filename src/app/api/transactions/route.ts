import { NextRequest, NextResponse } from 'next/server';
import { getDB, generateId } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json([]);
  const { results } = await db.prepare('SELECT * FROM transactions ORDER BY date DESC').all();
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const body = await req.json();
  const id = generateId();
  await db.prepare(
    'INSERT INTO transactions (id, type, category, amount, description, date, service, brand) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.type, body.category, body.amount, body.description, body.date,
    body.service || null, body.brand || null).run();
  return NextResponse.json({ id });
}
