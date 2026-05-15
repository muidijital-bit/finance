import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const body = await req.json();
  await db.prepare(
    'UPDATE budgets SET category=?, limit_amount=?, period=?, color=? WHERE id=?'
  ).bind(body.category, body.limit, body.period, body.color, params.id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  await db.prepare('DELETE FROM budgets WHERE id=?').bind(params.id).run();
  return NextResponse.json({ ok: true });
}
