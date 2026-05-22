import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const userRoleEnum = z.enum(['ADMIN', 'STUDENT', 'FACULTY', 'LIBRARIAN', 'AFFAIRS', 'MANAGER']);

export const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().max(120).optional(),
  role: userRoleEnum.optional(),
  collegeId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  active: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

const studentProfileFields = z.object({
  departmentId: z.string().uuid(),
  academicNumber: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[A-Za-z0-9-]+$/),
  currentSemester: z.coerce.number().int().min(1).max(10),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/),
});

export const adminCreateUserSchema = z
  .object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    password: z.string().min(6).max(128),
    role: userRoleEnum,
    collegeId: z.string().uuid().nullable().optional(),
    studentProfile: studentProfileFields.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'MANAGER' && !data.collegeId) {
      ctx.addIssue({ code: 'custom', message: 'College manager requires collegeId', path: ['collegeId'] });
    }
    if (data.role === 'STUDENT' && !data.studentProfile) {
      ctx.addIssue({
        code: 'custom',
        message: 'Student profile required for STUDENT role',
        path: ['studentProfile'],
      });
    }
  });

export const adminUpdateUserSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
  role: userRoleEnum.optional(),
  collegeId: z.string().uuid().nullable().optional(),
  active: z.boolean().optional(),
  password: z.string().min(6).max(128).optional(),
  studentProfile: studentProfileFields.partial().optional(),
});
