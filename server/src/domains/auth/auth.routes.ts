import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { AuthController } from './auth.controller.js';

export function createAuthRouter(controller: AuthController) {
  const r = Router();
  const limiter = rateLimit({ windowMs: 60_000, max: 30 });
  r.use(limiter);
  r.post('/login', asyncHandler(controller.login.bind(controller)));
  r.post('/register', asyncHandler(controller.register.bind(controller)));
  return r;
}
