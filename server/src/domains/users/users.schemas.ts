import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const userRoleEnum = z.enum(['ADMIN', 'STUDENT', 'FACULTY', 'LIBRARIAN', 'AFFAIRS', 'MANAGER']);

export const adminUpdateUserSchema = z.object({
  role: userRoleEnum.optional(),
  collegeId: z.string().uuid().nullable().optional(),
});
