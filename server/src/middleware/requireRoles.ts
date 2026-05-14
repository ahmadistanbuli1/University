import type { UserRole } from '@prisma/client';
import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';

export function requireRoles(...allowed: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    const user = req.authUser;
    if (!user) {
      return next(new AppError(401, 'Unauthorized'));
    }
    if (!allowed.includes(user.role)) {
      return next(new AppError(403, 'Forbidden'));
    }
    next();
  };
}
