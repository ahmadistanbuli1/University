import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import type { NotificationService } from './notification.service.js';

export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  listMine = async (req: Request, res: Response) => {
    const items = await this.notifications.listMine(req.authUser!.id);
    res.json(items);
  };

  unreadCount = async (req: Request, res: Response) => {
    const count = await this.notifications.unreadCount(req.authUser!.id);
    res.json({ count });
  };

  markRead = async (req: Request, res: Response) => {
    const result = await this.notifications.markRead(req.authUser!.id, paramId(req));
    res.json(result);
  };

  markAllRead = async (req: Request, res: Response) => {
    await this.notifications.markAllRead(req.authUser!.id);
    res.json({ ok: true });
  };
}
