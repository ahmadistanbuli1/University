import { z } from 'zod';

export const listBooksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  keyword: z.string().optional(),
});

export const createBookFieldsSchema = z.object({
  title: z.string().min(1),
  departmentId: z.string().uuid(),
  publishYear: z.coerce.number().int().min(1900).max(2100),
  keywords: z.string().optional(),
});
