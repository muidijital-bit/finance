import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  const body = await req.json();
  await db.prepare(
    'UPDATE payment_schedules SET title=?, amount=?, currency=?, due_day=?, type=?, category=?, payment_category=?, is_active=?, note=? WHERE id=?'
  ).bind(body.title, body.amount, body.currency, body.dueDay, body.type, body.category,
    body.paymentCategory ?? null, body.isActive ? 1 : 0, body.note ?? null, id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  await db.prepare('DELETE FROM payment_schedules WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
