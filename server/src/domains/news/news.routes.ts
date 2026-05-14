import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { NewsController } from './news.controller.js';

export function createNewsRouter(controller: NewsController, authenticate: RequestHandler) {
  const r = Router();
  r.get('/', asyncHandler(controller.list.bind(controller)));
  r.get('/:id', asyncHandler(controller.getById.bind(controller)));
  r.post(
    '/',
    authenticate,
    requireRoles('ADMIN', 'MANAGER'),
    asyncHandler(controller.create.bind(controller))
  );
  r.patch(
    '/:id',
    authenticate,
    requireRoles('ADMIN', 'MANAGER'),
    asyncHandler(controller.update.bind(controller))
  );
  r.delete(
    '/:id',
    authenticate,
    requireRoles('ADMIN', 'MANAGER'),
    asyncHandler(controller.remove.bind(controller))
  );
  return r;
}
