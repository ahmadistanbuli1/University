import type { Request, Response } from 'express';
import { departmentsQuerySchema } from './structure.schemas.js';
import type { StructureService } from './structure.service.js';

export class StructureController {
  constructor(private readonly structure: StructureService) {}

  colleges = async (_req: Request, res: Response) => {
    res.json(await this.structure.getColleges());
  };

  departments = async (req: Request, res: Response) => {
    const q = departmentsQuerySchema.parse(req.query);
    res.json(await this.structure.getDepartments(q.collegeId));
  };

  courses = async (_req: Request, res: Response) => {
    res.json(await this.structure.getCourses());
  };
}
