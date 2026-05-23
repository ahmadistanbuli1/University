import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import { listCurriculumQuerySchema, updateCurriculumSchema } from './curriculum.schemas.js';
import type { CurriculumService } from './curriculum.service.js';

export class CurriculumController {
  constructor(private readonly svc: CurriculumService) {}

  list = async (req: Request, res: Response) => {
    const q = listCurriculumQuerySchema.parse(req.query);
    const result = await this.svc.list(req.authUser!.role, req.authUser!.collegeId, q);
    res.json(result);
  };

  patch = async (req: Request, res: Response) => {
    const body = updateCurriculumSchema.parse(req.body);
    const updated = await this.svc.updateName(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req),
      body.name
    );
    res.json(updated);
  };

  remove = async (req: Request, res: Response) => {
    const result = await this.svc.delete(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req)
    );
    res.json(result);
  };
}
