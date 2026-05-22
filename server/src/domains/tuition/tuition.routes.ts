import { Router } from 'express';
import type { RequestHandler } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { TuitionController } from './tuition.controller.js';
import type { Env } from '../../config.js';

export function createTuitionRouter(
  controller: TuitionController,
  authenticate: RequestHandler,
  env: Env
) {
  const r = Router();
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const safe = `discount-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      cb(null, safe);
    },
  });
  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ok =
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      if (!ok) {
        cb(new Error('Proof must be an image or PDF/DOC file'));
        return;
      }
      cb(null, true);
    },
  });

  r.use(authenticate);

  r.get(
    '/summary/me',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.mySummary.bind(controller))
  );
  r.get(
    '/installments/:id/pay',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.installmentForPay.bind(controller))
  );
  r.post(
    '/payments/simulate',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.simulatePayment.bind(controller))
  );
  r.post(
    '/discounts',
    requireRoles('STUDENT', 'FACULTY'),
    upload.single('proof'),
    asyncHandler(controller.submitDiscount.bind(controller))
  );
  r.get(
    '/discounts/me',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.myDiscounts.bind(controller))
  );
  r.get(
    '/discounts',
    requireRoles('ADMIN'),
    asyncHandler(controller.listDiscounts.bind(controller))
  );
  r.patch(
    '/discounts/:id/review',
    requireRoles('ADMIN'),
    asyncHandler(controller.reviewDiscount.bind(controller))
  );

  return r;
}
