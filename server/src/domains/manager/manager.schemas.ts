import { z } from 'zod';

export const createManagerRequestSchema = z.object({
  subject: z.string().min(3).max(200),
  body: z.string().min(10).max(5000),
});

export const resolveManagerRequestSchema = z.object({
  status: z.enum(['RESOLVED', 'REJECTED']),
  adminResponse: z.string().min(3).max(2000),
});
