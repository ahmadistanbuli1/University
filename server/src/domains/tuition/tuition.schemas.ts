import { z } from 'zod';

export const simulatePaymentSchema = z.object({
  installmentId: z.string().uuid(),
});

export const discountRequestSchema = z.object({
  type: z.enum(['MARTYR_RELATIVE', 'ACADEMIC_EXCELLENCE', 'HUMANITARIAN']),
  notes: z.string().max(2000).optional(),
});

export const reviewDiscountSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  discountAmount: z.coerce.number().min(0).optional(),
  adminResponse: z.string().max(2000).optional(),
});
