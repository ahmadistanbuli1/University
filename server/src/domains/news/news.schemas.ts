import { z } from 'zod';

export const newsPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const createNewsSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
  collegeId: z.string().uuid().optional().nullable(),
  category: z.enum(['GENERAL', 'TUITION']).optional(),
  enablePayNow: z.boolean().optional(),
});

export const updateNewsSchema = createNewsSchema.partial();
