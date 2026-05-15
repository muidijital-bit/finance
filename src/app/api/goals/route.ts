import { NextRequest, NextResponse } from 'next/server';
import { getDB, generateId } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json([]);
  const { results } = await db.prepare('SELECT * FROM goals').all();
  return NextResponse.json(results.map((r: any) => ({
    ...r,
    targetAmount: r.target_amount,
    currentAmount: r.current_amount,
  })));
}

export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const body = await req.json();
  const id = generateId();
  await db.prepare(
    'INSERT INTO goals (id, name, target_amount, current_amount, deadline, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.name, body.targetAmount, body.currentAmount ?? 0, body.deadline, body.color, body.icon).run();
  return NextResponse.json({ id });
}
