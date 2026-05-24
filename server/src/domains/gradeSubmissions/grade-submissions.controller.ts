import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import {
  facultyCourseIdParamSchema,
  rejectSubmissionSchema,
} from './grade-submissions.schemas.js';
import type { GradeSubmissionsService } from './grade-submissions.service.js';

export class GradeSubmissionsController {
  constructor(private readonly svc: GradeSubmissionsService) {}

  facultyWorkspace = async (req: Request, res: Response) => {
    const { facultyCourseId } = facultyCourseIdParamSchema.parse(req.params);
    const data = await this.svc.getFacultyWorkspace(
      req.authUser!.id,
      req.authUser!.role,
      facultyCourseId
    );
    res.json(data);
  };

  saveDraft = async (req: Request, res: Response) => {
    const { facultyCourseId } = facultyCourseIdParamSchema.parse(req.params);
    const updated = await this.svc.saveDraft(req.authUser!.id, facultyCourseId, req.body);
    res.json(updated);
  };

  submit = async (req: Request, res: Response) => {
    const { facultyCourseId } = facultyCourseIdParamSchema.parse(req.params);
    const updated = await this.svc.submit(req.authUser!.id, facultyCourseId);
    res.json(updated);
  };

  listMine = async (req: Request, res: Response) => {
    const list = await this.svc.listMySubmissions(req.authUser!.id, req.authUser!.role);
    res.json(list);
  };

  listQueue = async (req: Request, res: Response) => {
    const list = await this.svc.listQueue(req.authUser!.role);
    res.json(list);
  };

  getById = async (req: Request, res: Response) => {
    const item = await this.svc.getById(paramId(req), req.authUser!.role, req.authUser!.id);
    res.json(item);
  };

  updateLines = async (req: Request, res: Response) => {
    const updated = await this.svc.updateLinesAsExamOfficer(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req),
      req.body
    );
    res.json(updated);
  };

  publish = async (req: Request, res: Response) => {
    const updated = await this.svc.publish(req.authUser!.id, req.authUser!.role, paramId(req));
    res.json(updated);
  };

  reject = async (req: Request, res: Response) => {
    const body = rejectSubmissionSchema.parse(req.body);
    const updated = await this.svc.reject(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req),
      body.rejectionReason
    );
    res.json(updated);
  };
}
