import { getRequestContext } from '@cloudflare/next-on-pages';

export function getDB() {
  try {
    return (getRequestContext().env as any).muimedya_finance as D1Database;
  } catch {
    // local dev without wrangler — return null, API routes will handle gracefully
    return null;
  }
}

export function generateId() {
  return crypto.randomUUID();
}
