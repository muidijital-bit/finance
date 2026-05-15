import { NextRequest, NextResponse } from 'next/server';
import { getDB, generateId } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json([]);
  const { results } = await db.prepare('SELECT * FROM employees ORDER BY name ASC').all();
  return NextResponse.json(results.map((r: any) => ({
    id: r.id,
    name: r.name,
    position: r.position ?? undefined,
    salary: r.salary,
    salaryCurrency: r.salary_currency,
    startDate: r.start_date ?? undefined,
    tcNo: r.tc_no ?? undefined,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    isActive: r.is_active === 1,
    note: r.note ?? undefined,
  })));
}

export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const body = await req.json();
  const id = generateId();
  await db.prepare(
    'INSERT INTO employees (id, name, position, salary, salary_currency, start_date, tc_no, phone, email, is_active, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.name, body.position ?? null, body.salary ?? 0, body.salaryCurrency ?? 'TRY',
    body.startDate ?? null, body.tcNo ?? null, body.phone ?? null, body.email ?? null, 1, body.note ?? null).run();
  return NextResponse.json({ id });
}
