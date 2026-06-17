import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validateUploadMagic } from '../../lib/file-magic.js';
import { createDiskUpload } from '../../lib/multer-upload.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { TuitionController } from './tuition.controller.js';
import type { Env } from '../../config.js';

const PROOF_MAGIC = ['pdf', 'jpeg', 'png', 'webp', 'gif'] as const;

export function createTuitionRouter(
  controller: TuitionController,
  authenticate: RequestHandler,
  env: Env
) {
  const r = Router();
  const upload = createDiskUpload(env.UPLOAD_DIR, {
    category: 'discounts',
    maxBytes: 10 * 1024 * 1024,
    allowedMagic: [...PROOF_MAGIC],
    allowedMime: /^(image\/(jpeg|png|webp|gif)|application\/pdf)$/,
  });
  const validateProofMagic = validateUploadMagic([...PROOF_MAGIC]);

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
    validateProofMagic,
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
  r.get(
    '/discounts/:id/proof',
    requireRoles('STUDENT', 'FACULTY', 'ADMIN'),
    asyncHandler(controller.downloadDiscountProof.bind(controller))
  );
  r.patch(
    '/discounts/:id/review',
    requireRoles('ADMIN'),
    asyncHandler(controller.reviewDiscount.bind(controller))
  );

  return r;
}
