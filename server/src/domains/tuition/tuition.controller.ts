import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import {
  discountRequestSchema,
  reviewDiscountSchema,
  simulatePaymentSchema,
} from './tuition.schemas.js';
import type { TuitionService } from './tuition.service.js';

export class TuitionController {
  constructor(private readonly svc: TuitionService) {}

  mySummary = async (req: Request, res: Response) => {
    const data = await this.svc.getMySummary(req.authUser!.id, req.authUser!.role);
    res.json(data);
  };

  installmentForPay = async (req: Request, res: Response) => {
    const data = await this.svc.getInstallmentForPay(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req)
    );
    res.json(data);
  };

  simulatePayment = async (req: Request, res: Response) => {
    const body = simulatePaymentSchema.parse(req.body);
    const result = await this.svc.simulatePayment(
      req.authUser!.id,
      req.authUser!.role,
      body.installmentId
    );
    res.status(201).json(result);
  };

  submitDiscount = async (req: Request, res: Response) => {
    const body = discountRequestSchema.parse(req.body);
    const file = req.file;
    const proofFilePath = file ? `/uploads/${file.filename}` : undefined;
    const created = await this.svc.submitDiscountRequest(
      req.authUser!.id,
      req.authUser!.role,
      body,
      proofFilePath
    );
    res.status(201).json(created);
  };

  myDiscounts = async (req: Request, res: Response) => {
    const list = await this.svc.listMyDiscountRequests(req.authUser!.id, req.authUser!.role);
    res.json(list);
  };

  listDiscounts = async (req: Request, res: Response) => {
    const list = await this.svc.listDiscountRequests(req.authUser!.role);
    res.json(list);
  };

  reviewDiscount = async (req: Request, res: Response) => {
    const body = reviewDiscountSchema.parse(req.body);
    const updated = await this.svc.reviewDiscountRequest(
      req.authUser!.id,
      req.authUser!.role,
      paramId(req),
      body
    );
    res.json(updated);
  };
}
