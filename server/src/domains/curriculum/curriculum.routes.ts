import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { CurriculumController } from './curriculum.controller.js';

export function createCurriculumRouter(
  controller: CurriculumController,
  authenticate: RequestHandler
) {
  const r = Router();
  r.use(authenticate);
  r.get(
    '/',
    requireRoles('ADMIN', 'MANAGER'),
    asyncHandler(controller.list.bind(controller))
  );
  r.patch(
    '/:id',
    requireRoles('ADMIN'),
    asyncHandler(controller.patch.bind(controller))
  );
  r.delete(
    '/:id',
    requireRoles('ADMIN'),
    asyncHandler(controller.remove.bind(controller))
  );
  return r;
}
