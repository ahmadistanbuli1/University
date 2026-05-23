import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { NotificationController } from './notification.controller.js';

export function createNotificationRouter(
  controller: NotificationController,
  authenticate: RequestHandler
) {
  const r = Router();
  r.use(authenticate);
  r.get('/', asyncHandler(controller.listMine.bind(controller)));
  r.get('/unread-count', asyncHandler(controller.unreadCount.bind(controller)));
  r.patch('/read-all', asyncHandler(controller.markAllRead.bind(controller)));
  r.patch('/:id/read', asyncHandler(controller.markRead.bind(controller)));
  return r;
}
