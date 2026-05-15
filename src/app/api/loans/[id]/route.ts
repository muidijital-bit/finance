import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  const b = await req.json();
  await db.prepare(
    `UPDATE loans SET title=?,lender=?,principal=?,total_amount=?,installment_count=?,installment_amount=?,start_date=?,due_day=?,currency=?,note=?,is_active=?,paid_count=? WHERE id=?`
  ).bind(b.title, b.lender ?? '', b.principal, b.totalAmount, b.installmentCount, b.installmentAmount, b.startDate, b.dueDay ?? 1, b.currency ?? 'TRY', b.note ?? '', b.isActive ? 1 : 0, b.paidCount ?? 0, id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  await db.prepare('DELETE FROM loans WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
