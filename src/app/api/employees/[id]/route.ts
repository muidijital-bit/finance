import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  const body = await req.json();
  await db.prepare(
    'UPDATE employees SET name=?, position=?, salary=?, salary_currency=?, start_date=?, tc_no=?, phone=?, email=?, is_active=?, note=? WHERE id=?'
  ).bind(body.name, body.position ?? null, body.salary ?? 0, body.salaryCurrency ?? 'TRY',
    body.startDate ?? null, body.tcNo ?? null, body.phone ?? null, body.email ?? null,
    body.isActive ? 1 : 0, body.note ?? null, id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { id } = await params;
  await db.prepare('DELETE FROM employees WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
