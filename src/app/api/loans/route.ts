import { NextRequest, NextResponse } from 'next/server';
import { getDB, generateId } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json([]);
  const { results } = await db.prepare('SELECT * FROM loans ORDER BY start_date DESC').all();
  return NextResponse.json(
    results.map((r: any) => ({
      id: r.id,
      title: r.title,
      lender: r.lender ?? '',
      principal: r.principal,
      totalAmount: r.total_amount,
      installmentCount: r.installment_count,
      installmentAmount: r.installment_amount,
      startDate: r.start_date,
      dueDay: r.due_day,
      currency: r.currency,
      note: r.note ?? '',
      isActive: r.is_active === 1,
      paidCount: r.paid_count ?? 0,
    }))
  );
}

export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const b = await req.json();
  const id = generateId();
  await db.prepare(
    `INSERT INTO loans (id,title,lender,principal,total_amount,installment_count,installment_amount,start_date,due_day,currency,note,is_active,paid_count)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,1,0)`
  ).bind(id, b.title, b.lender ?? '', b.principal, b.totalAmount, b.installmentCount, b.installmentAmount, b.startDate, b.dueDay ?? 1, b.currency ?? 'TRY', b.note ?? '').run();
  return NextResponse.json({ id });
}
