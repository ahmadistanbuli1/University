import type { Request, Response } from 'express';
import { paginationQuerySchema } from '../users/users.schemas.js';
import { updateFinancialSettingsSchema } from './admin.schemas.js';
import type { AdminService } from './admin.service.js';

export class AdminController {
  constructor(private readonly admin: AdminService) {}

  auditLogs = async (req: Request, res: Response) => {
    const q = paginationQuerySchema.parse(req.query);
    const data = await this.admin.listAuditLogs(q.page, q.pageSize);
    res.json(data);
  };

  dashboard = async (_req: Request, res: Response) => {
    const data = await this.admin.getDashboardSummary();
    res.json(data);
  };

  financialSettings = async (_req: Request, res: Response) => {
    const data = await this.admin.getFinancialSettings();
    res.json(data);
  };

  updateFinancialSettings = async (req: Request, res: Response) => {
    const body = updateFinancialSettingsSchema.parse(req.body);
    const data = await this.admin.updateFinancialSettings(req.authUser!.id, body);
    res.json(data);
  };
}
