import type { Request, Response } from 'express';
import { analyticsQuerySchema, createResultSchema } from './academic.schemas.js';
import type { AcademicService } from './academic.service.js';

export class AcademicController {
  constructor(private readonly academic: AcademicService) {}

  myEnrollments = async (req: Request, res: Response) => {
    const list = await this.academic.getMyEnrollments(req.authUser!.id, req.authUser!.role);
    res.json(list);
  };

  myResults = async (req: Request, res: Response) => {
    const data = await this.academic.getMyResults(req.authUser!.id, req.authUser!.role);
    res.json(data);
  };

  createResult = async (req: Request, res: Response) => {
    const body = createResultSchema.parse(req.body);
    const created = await this.academic.submitResult({
      facultyUserId: req.authUser!.id,
      ...body,
    });
    res.status(201).json(created);
  };

  analytics = async (req: Request, res: Response) => {
    const q = analyticsQuerySchema.parse(req.query);
    const data = await this.academic.getAnalytics({
      requesterId: req.authUser!.id,
      role: req.authUser!.role,
      facultyCourseId: q.facultyCourseId,
    });
    res.json(data);
  };
}
