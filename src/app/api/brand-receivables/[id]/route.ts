import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  const b = await req.json();
  await db.prepare(
    'UPDATE brand_receivables SET fixed_amount=?, extra_amount=?, currency=?, note=? WHERE id=?'
  ).bind(b.fixedAmount ?? 0, b.extraAmount ?? 0, b.currency ?? 'TRY', b.note ?? '', id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  await db.prepare('DELETE FROM brand_receivables WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
