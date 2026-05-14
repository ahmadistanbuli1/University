import type { UserRole } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';
import type { Env } from '../config.js';
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

export function createAuthenticateMiddleware(env: Env) {
  return function authenticate(req: Request, _res: Response, next: NextFunction) {
    req.env = env;
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next(new AppError(401, 'Missing or invalid authorization header'));
    }
    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      return next(new AppError(401, 'Missing token'));
    }
    try {
      const payload = verifyToken(env, token);
      req.authUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        collegeId: payload.collegeId ?? null,
      };
      next();
    } catch {
      next(new AppError(401, 'Invalid or expired token'));
    }
  };
}

export function optionalAuthenticate(env: Env) {
  return function optionalAuth(req: Request, _res: Response, next: NextFunction) {
    req.env = env;
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next();
    }
    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      return next();
    }
    try {
      const payload = verifyToken(env, token);
      req.authUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        collegeId: payload.collegeId ?? null,
      };
    } catch {
      // ignore invalid token for optional auth
    }
    next();
  };
}
