import type { UserRole } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';
import type { Env } from '../config.js';
import { AUTH_COOKIE_NAME } from '../lib/auth-cookie.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  collegeId: string | null;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
      env?: Env;
    }
  }
}

function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === 'string' && cookieToken.trim()) {
    return cookieToken.trim();
  }

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const bearer = header.slice('Bearer '.length).trim();
    if (bearer) return bearer;
  }

  return null;
}

function attachAuthUser(req: Request, env: Env, token: string) {
  const payload = verifyToken(env, token);
  req.authUser = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    collegeId: payload.collegeId ?? null,
  };
}

export function createAuthenticateMiddleware(env: Env) {
  return function authenticate(req: Request, _res: Response, next: NextFunction) {
    req.env = env;
    const token = extractToken(req);
    if (!token) {
      return next(new AppError(401, 'Missing or invalid authentication'));
    }
    try {
      attachAuthUser(req, env, token);
      next();
    } catch {
      next(new AppError(401, 'Invalid or expired token'));
    }
  };
}

export function optionalAuthenticate(env: Env) {
  return function optionalAuth(req: Request, _res: Response, next: NextFunction) {
    req.env = env;
    const token = extractToken(req);
    if (!token) {
      return next();
    }
    try {
      attachAuthUser(req, env, token);
    } catch {
      // ignore invalid token for optional auth
    }
    next();
  };
}
