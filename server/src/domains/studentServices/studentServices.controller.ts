import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import {
  createAppealSchema,
  fulfillTranscriptSchema,
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
    const body = fulfillTranscriptSchema.parse(req.body);
    const updated = await this.svc.fulfillTranscript(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req),
      body
    );
    res.json(updated);
  };

  myTranscripts = async (req: Request, res: Response) => {
    const list = await this.svc.listMyTranscripts(req.authUser!.id, req.authUser!.role);
    res.json(list);
  };

  listTranscripts = async (req: Request, res: Response) => {
    const list = await this.svc.listAllTranscripts(req.authUser!.role);
    res.json(list);
  };
}
