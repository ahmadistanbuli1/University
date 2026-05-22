import { z } from 'zod';
import { LIBRARY_BOOK_CATEGORIES } from './library-categories.js';

const categoryEnum = z.enum(LIBRARY_BOOK_CATEGORIES);

export const listBooksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  keyword: z.string().optional(),
  category: categoryEnum.optional(),
});

export const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  category: categoryEnum.optional(),
  publishYear: z.coerce.number().int().min(1900).max(2100).optional(),
  keywords: z.string().optional(),
});

export const createBookFieldsSchema = z.object({
  title: z.string().min(1),
  category: categoryEnum,
  departmentId: z.string().uuid().optional(),
  publishYear: z.coerce.number().int().min(1900).max(2100),
  keywords: z.string().optional(),
});
