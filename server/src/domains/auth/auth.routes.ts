import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authLoginLimiter, authRegisterLimiter } from '../../middleware/rate-limit.js';
import type { AuthController } from './auth.controller.js';

export function createAuthRouter(
  controller: AuthController,
  authenticate: RequestHandler,
  optionalAuth: RequestHandler
) {
  const r = Router();
  r.post('/login', authLoginLimiter, asyncHandler(controller.login.bind(controller)));
  r.post('/register', authRegisterLimiter, asyncHandler(controller.register.bind(controller)));
  r.post('/logout', optionalAuth, asyncHandler(controller.logout.bind(controller)));
  r.get('/me', authenticate, asyncHandler(controller.me.bind(controller)));
  return r;
}
