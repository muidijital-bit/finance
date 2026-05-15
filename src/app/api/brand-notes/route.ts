import { NextRequest, NextResponse } from 'next/server';
import { getDB, generateId } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json([]);
  const brand = new URL(req.url).searchParams.get('brand');
  if (!brand) return NextResponse.json([]);
  const { results } = await db
    .prepare('SELECT * FROM brand_notes WHERE brand=? ORDER BY created_at DESC')
    .bind(brand).all();
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const { brand, content } = await req.json();
  const id = generateId();
  const now = new Date().toISOString();
  await db.prepare('INSERT INTO brand_notes (id, brand, content, created_at) VALUES (?, ?, ?, ?)')
    .bind(id, brand, content, now).run();
  return NextResponse.json({ id, brand, content, createdAt: now });
}

export async function DELETE(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
  await db.prepare('DELETE FROM brand_notes WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
