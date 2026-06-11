import type { CookieOptions, Response } from 'express';
import type { Env } from '../config.js';

export const AUTH_COOKIE_NAME = 'university_auth';

/** Parse JWT-style duration (e.g. 7d, 12h, 3600) into milliseconds for cookie maxAge. */
export function parseDurationMs(value: string): number {
  const trimmed = value.trim();
  const asNumber = Number(trimmed);
  if (!Number.isNaN(asNumber) && asNumber > 0) {
    return asNumber * 1000;
  }
  const match = /^(\d+)([smhd])$/i.exec(trimmed);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return amount * (multipliers[unit] ?? 86_400_000);
}

export function getAuthCookieOptions(env: Env): CookieOptions {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'lax' : 'lax',
    path: '/',
    maxAge: parseDurationMs(env.JWT_EXPIRES_IN),
  };
}

export function setAuthCookie(res: Response, token: string, env: Env) {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions(env));
}

export function clearAuthCookie(res: Response, env: Env) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'lax' : 'lax',
    path: '/',
  });
}
