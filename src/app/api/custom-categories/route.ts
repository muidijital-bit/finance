import { NextRequest, NextResponse } from 'next/server';
import { getDB, generateId } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json([]);
  const { results } = await db.prepare('SELECT * FROM custom_categories ORDER BY label ASC').all();
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const body = await req.json();
  const id = generateId();
  const key = `custom_${id}`;
  await db.prepare(
    'INSERT INTO custom_categories (id, type, key, label, icon, color) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, body.type, key, body.label, body.icon ?? '📌', body.color ?? '#9ca3af').run();
  return NextResponse.json({ id, key });
}

export async function DELETE(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
  await db.prepare('DELETE FROM custom_categories WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
