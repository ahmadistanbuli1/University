import { Router } from 'express';
import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { AuthController } from './auth.controller.js';

export function createAuthRouter(
  controller: AuthController,
  authenticate: RequestHandler,
  optionalAuth: RequestHandler
) {
  const r = Router();
  const limiter = rateLimit({ windowMs: 60_000, max: 30 });
  r.use(limiter);
  r.post('/login', asyncHandler(controller.login.bind(controller)));
  r.post('/register', asyncHandler(controller.register.bind(controller)));
  r.post('/logout', optionalAuth, asyncHandler(controller.logout.bind(controller)));
  r.get('/me', authenticate, asyncHandler(controller.me.bind(controller)));
  return r;
}
