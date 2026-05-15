import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

// POST { from: string[], to: string }
// Updates all transactions where brand is in `from` to use `to`
export async function POST(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json({ error: 'DB yok' }, { status: 500 });

  const { from, to }: { from: string[]; to: string } = await req.json();
  if (!from?.length || !to) return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });

  const placeholders = from.map(() => '?').join(',');
  const result = await db
    .prepare(`UPDATE transactions SET brand=? WHERE brand IN (${placeholders})`)
    .bind(to, ...from)
    .run();

  return NextResponse.json({ ok: true, changes: result.meta?.changes ?? 0 });
}
