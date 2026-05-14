import { z } from 'zod';

export const createResultSchema = z.object({
  studentId: z.string().uuid(),
  facultyCourseId: z.string().uuid(),
  score: z.coerce.number().min(0).max(100),
  semester: z.string().min(1),
  academicYear: z.string().min(1),
  attemptNumber: z.coerce.number().int().min(1).optional(),
});

export const analyticsQuerySchema = z.object({
  facultyCourseId: z.string().uuid(),
});
