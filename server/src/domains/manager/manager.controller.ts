import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import {
  createManagerRequestSchema,
  resolveManagerRequestSchema,
} from './manager.schemas.js';
import type { ManagerService } from './manager.service.js';

export class ManagerController {
  constructor(private readonly svc: ManagerService) {}

  create = async (req: Request, res: Response) => {
    const body = createManagerRequestSchema.parse(req.body);
    const created = await this.svc.createRequest(req.authUser!.id, req.authUser!.role, body);
    res.status(201).json(created);
  };

  listMine = async (req: Request, res: Response) => {
    const list = await this.svc.listMyRequests(req.authUser!.id, req.authUser!.role);
    res.json(list);
  };

  listAdmin = async (req: Request, res: Response) => {
    const list = await this.svc.listForAdmin(req.authUser!.role);
    res.json(list);
  };

  resolve = async (req: Request, res: Response) => {
    const body = resolveManagerRequestSchema.parse(req.body);
    const updated = await this.svc.resolve(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req),
      body
    );
    res.json(updated);
  };
}
