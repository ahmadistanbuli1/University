import { z } from 'zod';

export const listCurriculumQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  studyYear: z.coerce.number().int().min(1).max(6).optional(),
});

export const updateCurriculumSchema = z.object({
  name: z.string().min(2).max(200),
});
