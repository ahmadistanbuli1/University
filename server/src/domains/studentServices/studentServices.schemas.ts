import { z } from 'zod';

export const createAppealSchema = z.object({
  examResultId: z.string().uuid(),
  reason: z.string().min(5),
});

export const updateAppealSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  adminResponse: z.string().optional(),
});

export const processTranscriptSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approve') }),
  z.object({
    action: z.literal('reject'),
    rejectionReason: z.string().min(3).max(500),
  }),
]);

export const listStudentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(120).optional(),
  departmentId: z.string().uuid().optional(),
  studyYear: z.coerce.number().int().min(1).max(6).optional(),
});

export const affairsUpdateStudentSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  departmentId: z.string().uuid().optional(),
  academicNumber: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[A-Za-z0-9-]+$/)
    .optional(),
  currentSemester: z.coerce.number().int().min(1).max(10).optional(),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/).optional(),
});
