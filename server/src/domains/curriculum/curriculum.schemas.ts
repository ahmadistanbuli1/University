import { z } from 'zod';

export const listCurriculumQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  studyYear: z.coerce.number().int().min(1).max(6).optional(),
});

export const updateCurriculumSchema = z.object({
  name: z.string().min(2).max(200),
});

export const createCurriculumSchema = z.object({
  departmentId: z.string().uuid(),
  studyYear: z.coerce.number().int().min(1).max(10),
  term: z.enum(['FIRST', 'SECOND']),
  name: z.string().min(2).max(200),
  code: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/)
    .optional(),
});
