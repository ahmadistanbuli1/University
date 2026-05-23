import { z } from 'zod';

export const createResultSchema = z.object({
  facultyCourseId: z.string().uuid(),
  academicNumber: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[A-Za-z0-9-]+$/),
  practicalScore: z.coerce.number().min(0).max(40),
  theoryScore: z.coerce.number().min(0).max(60),
});

export const analyticsQuerySchema = z.object({
  facultyCourseId: z.string().uuid(),
});

export const studyPlanQuerySchema = z.object({
  studyYear: z.coerce.number().int().min(1).max(6).optional(),
});
