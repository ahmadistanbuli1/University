import { z } from 'zod';

export const departmentsQuerySchema = z.object({
  collegeId: z.string().uuid().optional(),
});
