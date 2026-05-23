import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import {
  affairsUpdateStudentSchema,
  createAppealSchema,
  listStudentsQuerySchema,
  processTranscriptSchema,
  updateAppealSchema,
} from './studentServices.schemas.js';
import type { StudentServicesService } from './studentServices.service.js';

export class StudentServicesController {
  constructor(private readonly svc: StudentServicesService) {}

  createAppeal = async (req: Request, res: Response) => {
    const body = createAppealSchema.parse(req.body);
    const appeal = await this.svc.submitAppeal(req.authUser!.id, req.authUser!.role, body);
    res.status(201).json(appeal);
  };

  listAppeals = async (req: Request, res: Response) => {
    const list = await this.svc.listAppeals(req.authUser!.id);
    res.json(list);
  };

  myAppeals = async (req: Request, res: Response) => {
    const list = await this.svc.listMyAppeals(req.authUser!.id, req.authUser!.role);
    res.json(list);
  };

  patchAppeal = async (req: Request, res: Response) => {
    const body = updateAppealSchema.parse(req.body);
    const updated = await this.svc.updateAppealStatus(req.authUser!.id, paramId(req), body);
    res.json(updated);
  };

  requestTranscript = async (req: Request, res: Response) => {
    const created = await this.svc.requestTranscript(req.authUser!.id, req.authUser!.role);
    res.status(201).json(created);
  };

  patchTranscript = async (req: Request, res: Response) => {
    const body = processTranscriptSchema.parse(req.body);
    const updated = await this.svc.processTranscript(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req),
      body
    );
    res.json(updated);
  };

  downloadTranscript = async (req: Request, res: Response) => {
    const { absolutePath, fileName } = await this.svc.getTranscriptFile(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req)
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.sendFile(absolutePath);
  };

  myTranscripts = async (req: Request, res: Response) => {
    const list = await this.svc.listMyTranscripts(req.authUser!.id, req.authUser!.role);
    res.json(list);
  };

  listTranscripts = async (req: Request, res: Response) => {
    const list = await this.svc.listAllTranscripts(req.authUser!.role);
    res.json(list);
  };

  listStudents = async (req: Request, res: Response) => {
    const q = listStudentsQuerySchema.parse(req.query);
    const result = await this.svc.listStudents(
      req.authUser!.role,
      req.authUser!.collegeId,
      q
    );
    res.json(result);
  };

  patchStudent = async (req: Request, res: Response) => {
    const body = affairsUpdateStudentSchema.parse(req.body);
    const updated = await this.svc.updateStudentProfile(
      req.authUser!.role,
      req.authUser!.collegeId,
      paramId(req),
      body
    );
    res.json(updated);
  };
}
