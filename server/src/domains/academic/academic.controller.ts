import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import { analyticsQuerySchema, createResultSchema, studyPlanQuerySchema } from './academic.schemas.js';
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

  sectionRoster = async (req: Request, res: Response) => {
    const facultyCourseId = paramId(req);
    const list = await this.academic.getSectionRoster(
      req.authUser!.id,
      req.authUser!.role,
      facultyCourseId
    );
    res.json(list);
  };

  createResult = async (req: Request, res: Response) => {
    const body = createResultSchema.parse(req.body);
    const created = await this.academic.submitResult({
      facultyUserId: req.authUser!.id,
      role: req.authUser!.role,
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

  myStudyPlan = async (req: Request, res: Response) => {
    const q = studyPlanQuerySchema.parse(req.query);
    const data = await this.academic.getMyStudyPlan(
      req.authUser!.id,
      req.authUser!.role,
      q.studyYear
    );
    res.json(data);
  };
}
