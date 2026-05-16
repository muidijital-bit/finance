import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  const body = await req.json();
  await db.prepare(
    'UPDATE brands SET label=?, color=?, is_active=?, note=?, monthly_target=?, target_currency=?, due_day=? WHERE id=?'
  ).bind(body.label, body.color, body.isActive ? 1 : 0, body.note ?? null, body.monthlyTarget ?? 0, body.targetCurrency ?? 'TRY', body.dueDay ?? 1, id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  await db.prepare('DELETE FROM brands WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
