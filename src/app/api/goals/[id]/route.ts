import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  const body = await req.json();
  await db.prepare(
    'UPDATE goals SET name=?, target_amount=?, current_amount=?, deadline=?, color=?, icon=? WHERE id=?'
  ).bind(body.name, body.targetAmount, body.currentAmount, body.deadline, body.color, body.icon, id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  await db.prepare('DELETE FROM goals WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
