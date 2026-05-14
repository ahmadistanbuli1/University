import type { Request } from 'express';

/** Express 5 types `req.params` values as `string | string[]`; normalize to a single string. */
export function paramId(req: Request): string {
  const raw = req.params.id;
  if (Array.isArray(raw)) {
    return raw[0] ?? '';
  }
  return typeof raw === 'string' ? raw : '';
}
