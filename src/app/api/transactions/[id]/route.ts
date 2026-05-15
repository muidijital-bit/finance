import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  const body = await req.json();
  await db.prepare(
    'UPDATE transactions SET type=?, category=?, amount=?, description=?, date=? WHERE id=?'
  ).bind(body.type, body.category, body.amount, body.description, body.date, id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  await db.prepare('DELETE FROM transactions WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
