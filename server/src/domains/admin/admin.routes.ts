import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { AdminController } from './admin.controller.js';

export function createAdminRouter(controller: AdminController, authenticate: RequestHandler) {
  const r = Router();
  r.use(authenticate);
  r.get('/dashboard', requireRoles('ADMIN'), asyncHandler(controller.dashboard.bind(controller)));
  r.get('/audit-logs', requireRoles('ADMIN'), asyncHandler(controller.auditLogs.bind(controller)));
  return r;
}
