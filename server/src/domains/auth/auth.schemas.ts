import { z } from 'zod';
import { passwordSchema } from '../../lib/password-policy.js';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const academicYearPattern = /^\d{4}-\d{4}$/;

export const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: passwordSchema,
  departmentId: z.string().uuid(),
  academicNumber: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[A-Za-z0-9-]+$/, 'Academic number: letters, numbers, and hyphens only'),
  currentSemester: z.coerce.number().int().min(1).max(10),
  academicYear: z
    .string()
    .regex(academicYearPattern, 'Use format YYYY-YYYY (e.g. 2025-2026)')
    .optional(),
});
