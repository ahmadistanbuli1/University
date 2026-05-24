import type { Request, Response } from 'express';
import type { AuditService } from './audit.service.js';

export class ActivityLogController {
  constructor(private readonly audit: AuditService) {}

  listMine = async (req: Request, res: Response) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
    const data = await this.audit.listMyActivity(req.authUser!.id, { page, pageSize });
    res.json(data);
  };
}
