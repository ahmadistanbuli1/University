import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { ActivityLogController } from './activity-log.controller.js';

export function createActivityLogRouter(
  controller: ActivityLogController,
  authenticate: RequestHandler
) {
  const r = Router();
  r.use(authenticate);
  r.get(
    '/mine',
    requireRoles('FACULTY', 'AFFAIRS', 'EXAM_OFFICER', 'ADMIN'),
    asyncHandler(controller.listMine.bind(controller))
  );
  return r;
}
