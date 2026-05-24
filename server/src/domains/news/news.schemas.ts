import { z } from 'zod';

export const NEWS_CONTENT_CATEGORIES = ['ANNOUNCEMENT', 'WORKSHOP', 'TRAINING', 'TUITION'] as const;
export type NewsContentCategory = (typeof NEWS_CONTENT_CATEGORIES)[number];

export const newsPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  collegeId: z.string().uuid().optional(),
  category: z.enum(NEWS_CONTENT_CATEGORIES).optional(),
});

const newsBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
  collegeId: z.string().uuid().optional().nullable(),
  category: z.enum(NEWS_CONTENT_CATEGORIES).optional(),
  enablePayNow: z.boolean().optional(),
  tuitionSemesterKey: z.enum(['semester-1', 'semester-2']).optional().nullable(),
  /** MANAGER: college-only post vs university-wide (collegeId cleared). */
  scope: z.enum(['COLLEGE', 'UNIVERSITY']).optional(),
});

export const createNewsSchema = newsBodySchema.superRefine((data, ctx) => {
  if (data.category === 'TUITION' && data.enablePayNow && !data.tuitionSemesterKey) {
    ctx.addIssue({
      code: 'custom',
      message: 'Tuition semester target required when pay link is enabled',
      path: ['tuitionSemesterKey'],
    });
  }
  if (data.scope === 'UNIVERSITY' && !data.category) {
    ctx.addIssue({
      code: 'custom',
      message: 'News type is required for university-wide posts',
      path: ['category'],
    });
  }
  if (
    data.scope === 'UNIVERSITY' &&
    data.category &&
    data.category !== 'ANNOUNCEMENT' &&
    data.category !== 'WORKSHOP' &&
    data.category !== 'TRAINING'
  ) {
    // TUITION only via admin without scope
  }
});

export const updateNewsSchema = newsBodySchema.partial();
