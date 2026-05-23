import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { ManagerController } from './manager.controller.js';

export function createManagerRouter(
  controller: ManagerController,
  authenticate: RequestHandler
) {
  const r = Router();
  r.use(authenticate);
  r.post(
    '/requests',
    requireRoles('MANAGER'),
    asyncHandler(controller.create.bind(controller))
  );
  r.get(
    '/requests',
    requireRoles('MANAGER'),
    asyncHandler(controller.listMine.bind(controller))
  );
  return r;
}

export function createAdminManagerRequestsRouter(
  controller: ManagerController,
  authenticate: RequestHandler
) {
  const r = Router();
  r.use(authenticate);
  r.get(
    '/manager-requests',
    requireRoles('ADMIN'),
    asyncHandler(controller.listAdmin.bind(controller))
  );
  r.patch(
    '/manager-requests/:id',
    requireRoles('ADMIN'),
    asyncHandler(controller.resolve.bind(controller))
  );
  return r;
}
