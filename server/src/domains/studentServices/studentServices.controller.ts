import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import {
  affairsCreateStudentSchema,
  affairsUpdateStudentSchema,
  createAppealSchema,
  listStudentsQuerySchema,
  processClearanceSchema,
  processTranscriptSchema,
  requestClearanceSchema,
  requestTranscriptSchema,
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
    const body = requestTranscriptSchema.parse(req.body);
    const created = await this.svc.requestTranscript(
      req.authUser!.id,
      req.authUser!.role,
      body
    );
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

  listExamOfficerTranscripts = async (req: Request, res: Response) => {
    const list = await this.svc.listExamOfficerTranscripts(req.authUser!.role);
    res.json(list);
  };

  fulfillTranscript = async (req: Request, res: Response) => {
    const updated = await this.svc.fulfillTranscript(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req)
    );
    res.json(updated);
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
      req.authUser!.id,
      req.authUser!.role,
      req.authUser!.collegeId,
      paramId(req),
      body
    );
    res.json(updated);
  };

  affairsDashboard = async (req: Request, res: Response) => {
    const data = await this.svc.getAffairsDashboard(req.authUser!.role);
    res.json(data);
  };

  createStudent = async (req: Request, res: Response) => {
    const body = affairsCreateStudentSchema.parse(req.body);
    const created = await this.svc.createStudent(req.authUser!.id, req.authUser!.role, body);
    res.status(201).json(created);
  };

  deleteStudent = async (req: Request, res: Response) => {
    const updated = await this.svc.deleteStudent(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req)
    );
    res.json(updated);
  };

  downloadStudentProfile = async (req: Request, res: Response) => {
    const { absolutePath, fileName } = await this.svc.getStudentProfilePdf(
      req.authUser!.role,
      req.authUser!.collegeId,
      paramId(req)
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.sendFile(absolutePath);
  };

  requestClearance = async (req: Request, res: Response) => {
    const body = requestClearanceSchema.parse(req.body);
    const created = await this.svc.requestClearance(
      req.authUser!.id,
      req.authUser!.role,
      body
    );
    res.status(201).json(created);
  };

  myClearances = async (req: Request, res: Response) => {
    const list = await this.svc.listMyClearances(req.authUser!.id, req.authUser!.role);
    res.json(list);
  };

  listClearances = async (req: Request, res: Response) => {
    const list = await this.svc.listAllClearances(req.authUser!.role);
    res.json(list);
  };

  patchClearance = async (req: Request, res: Response) => {
    const body = processClearanceSchema.parse(req.body);
    const updated = await this.svc.processClearance(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req),
      body
    );
    res.json(updated);
  };

  deliverClearance = async (req: Request, res: Response) => {
    const updated = await this.svc.deliverClearance(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req)
    );
    res.json(updated);
  };

  downloadClearance = async (req: Request, res: Response) => {
    const { absolutePath, fileName } = await this.svc.getClearanceFile(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req)
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.sendFile(absolutePath);
  };

  serviceFees = async (_req: Request, res: Response) => {
    const fees = await this.svc.getServiceFees();
    res.json(fees);
  };
}
