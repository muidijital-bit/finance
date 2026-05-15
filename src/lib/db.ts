import { getRequestContext } from '@cloudflare/next-on-pages';

export function getDB() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getRequestContext().env as any).muimedya_finance as any;
  } catch {
    return null;
  }
}

export function generateId() {
  return crypto.randomUUID();
}
