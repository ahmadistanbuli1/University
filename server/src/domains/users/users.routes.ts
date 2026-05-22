import type { RequestHandler } from 'express';
import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { UsersController } from './users.controller.js';

export function createUsersRouter(controller: UsersController, authenticate: RequestHandler) {
  const r = Router();
  r.get('/faculty', asyncHandler(controller.facultyDirectory.bind(controller)));

  r.get('/me', authenticate, asyncHandler(controller.me.bind(controller)));

  r.get('/', authenticate, requireRoles('ADMIN'), asyncHandler(controller.listUsers.bind(controller)));
  r.post('/', authenticate, requireRoles('ADMIN'), asyncHandler(controller.createUser.bind(controller)));
  r.get('/:id', authenticate, requireRoles('ADMIN'), asyncHandler(controller.getUser.bind(controller)));
  r.patch(
    '/:id',
    authenticate,
    requireRoles('ADMIN'),
    asyncHandler(controller.patchUser.bind(controller))
  );
  r.delete(
    '/:id',
    authenticate,
    requireRoles('ADMIN'),
    asyncHandler(controller.deactivateUser.bind(controller))
  );
  return r;
}
