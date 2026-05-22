import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: 'Min 6 characters' }),
});

const academicYearPattern = /^\d{4}-\d{4}$/;

export const registerFormSchema = z.object({
  name: z.string().min(1, { message: 'Required' }),
  email: z.string().email(),
  password: z.string().min(6, { message: 'Min 6 characters' }),
  departmentId: z.string().uuid({ message: 'Select your department' }),
  academicNumber: z
    .string()
    .min(3, { message: 'At least 3 characters' })
    .max(32)
    .regex(/^[A-Za-z0-9-]+$/, { message: 'Letters, numbers, and hyphens only' }),
  currentSemester: z.coerce.number().int().min(1).max(10),
  academicYear: z.string().regex(academicYearPattern, { message: 'Use format e.g. 2025-2026' }),
});

export const appealFormSchema = z.object({
  examResultId: z.string().min(1, { message: 'Select a result' }).uuid({ message: 'Invalid selection' }),
  reason: z.string().min(5, { message: 'At least 5 characters' }),
});

export const facultyGradeFormSchema = z.object({
  facultyCourseId: z.string().uuid({ message: 'Select a section' }),
  studentId: z.string().uuid({ message: 'Select a student' }),
  score: z.coerce.number().min(0).max(100),
  semester: z.string().max(64).optional(),
  academicYear: z.string().max(64).optional(),
  attemptNumber: z.string().optional(),
});

export const managerNewsFormSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.union([z.literal(''), z.string().url()]),
  collegeId: z.union([z.literal(''), z.string().uuid()]),
});

export const librarianBookFieldsSchema = z.object({
  title: z.string().min(1),
  category: z.enum([
    'MEDICAL',
    'ADMINISTRATIVE',
    'SCIENTIFIC',
    'PROGRAMMING',
    'FRONTEND_WEB',
    'BACKEND_WEB',
    'ARTIFICIAL_INTELLIGENCE',
  ]),
  publishYear: z.coerce.number().int().min(1900).max(2100),
  keywords: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type AppealFormValues = z.infer<typeof appealFormSchema>;
export type FacultyGradeFormValues = z.infer<typeof facultyGradeFormSchema>;
export type ManagerNewsFormValues = z.infer<typeof managerNewsFormSchema>;
export type LibrarianBookFormValues = z.infer<typeof librarianBookFieldsSchema>;

export type LibrarianEditBookFormValues = LibrarianBookFormValues;

const userRoleEnum = z.enum(['ADMIN', 'STUDENT', 'FACULTY', 'LIBRARIAN', 'AFFAIRS', 'MANAGER']);

export const adminCreateUserFormSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: userRoleEnum,
    collegeId: z.union([z.literal(''), z.string().uuid()]),
    departmentId: z.union([z.literal(''), z.string().uuid()]),
    academicNumber: z.string().optional(),
    currentSemester: z.coerce.number().int().min(1).max(10).optional(),
    academicYear: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.role === 'MANAGER' && !d.collegeId) {
      ctx.addIssue({ code: 'custom', message: 'College required', path: ['collegeId'] });
    }
    if (d.role === 'STUDENT') {
      if (!d.departmentId) ctx.addIssue({ code: 'custom', message: 'Required', path: ['departmentId'] });
      if (!d.academicNumber || d.academicNumber.length < 3) {
        ctx.addIssue({ code: 'custom', message: 'Required', path: ['academicNumber'] });
      }
    }
  });

export const adminEditUserFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: userRoleEnum,
  collegeId: z.union([z.literal(''), z.string().uuid()]),
  active: z.boolean(),
  password: z.union([z.literal(''), z.string().min(6)]),
  departmentId: z.union([z.literal(''), z.string().uuid()]).optional(),
  academicNumber: z.string().optional(),
  currentSemester: z.coerce.number().int().min(1).max(10).optional(),
  academicYear: z.string().optional(),
});

export type AdminCreateUserFormValues = z.infer<typeof adminCreateUserFormSchema>;
export type AdminEditUserFormValues = z.infer<typeof adminEditUserFormSchema>;
