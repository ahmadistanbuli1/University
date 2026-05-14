import { z } from 'zod';

export const createAppealSchema = z.object({
  examResultId: z.string().uuid(),
  reason: z.string().min(5),
});

export const updateAppealSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  adminResponse: z.string().optional(),
});

export const fulfillTranscriptSchema = z.object({
  filePath: z.string().min(1),
  status: z.enum(['DELIVERED', 'PROCESSED']).default('DELIVERED'),
});
