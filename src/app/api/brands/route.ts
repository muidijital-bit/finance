import { NextRequest, NextResponse } from 'next/server';
import { getDB, generateId } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json([]);
  const { results } = await db.prepare('SELECT * FROM brands ORDER BY label ASC').all();
  return NextResponse.json(results.map((r: any) => ({
    ...r,
    isActive: r.is_active === 1,
    note: r.note ?? undefined,
  })));
}

export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const body = await req.json();
  const id = generateId();
  const value = body.value || body.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  await db.prepare(
    'INSERT OR REPLACE INTO brands (id, value, label, color, is_active, note) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, value, body.label, body.color ?? '#9ca3af', 1, body.note ?? null).run();
  return NextResponse.json({ id, value });
}
