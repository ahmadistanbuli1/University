import { z } from 'zod';

export const NEWS_CONTENT_CATEGORIES = ['ANNOUNCEMENT', 'WORKSHOP', 'TRAINING', 'TUITION'] as const;
export type NewsContentCategory = (typeof NEWS_CONTENT_CATEGORIES)[number];

export const newsPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  collegeId: z.string().uuid().optional(),
  category: z.enum(NEWS_CONTENT_CATEGORIES).optional(),
});

const imageUrlSchema = z
  .union([z.literal(''), z.string().url(), z.string().regex(/^\/uploads\//)])
  .optional()
  .nullable()
  .transform((v) => (v === '' || v == null ? null : v));

const newsBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: imageUrlSchema,
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

/** Multipart form fields arrive as strings */
export function parseNewsFormBody(raw: Record<string, unknown>) {
  const enablePayNow =
    raw.enablePayNow === true ||
    raw.enablePayNow === 'true' ||
    raw.enablePayNow === '1';
  return createNewsSchema.parse({
    title: raw.title,
    content: raw.content,
    imageUrl: raw.imageUrl,
    collegeId: raw.collegeId === '' ? null : raw.collegeId,
    category: raw.category || undefined,
    enablePayNow,
    tuitionSemesterKey:
      raw.tuitionSemesterKey === '' || raw.tuitionSemesterKey == null
        ? null
        : raw.tuitionSemesterKey,
    scope: raw.scope || undefined,
  });
}

export function parseNewsUpdateBody(raw: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  for (const key of [
    'title',
    'content',
    'imageUrl',
    'collegeId',
    'category',
    'tuitionSemesterKey',
    'scope',
  ] as const) {
    if (raw[key] !== undefined) patch[key] = raw[key] === '' ? null : raw[key];
  }
  if (raw.enablePayNow !== undefined) {
    patch.enablePayNow =
      raw.enablePayNow === true || raw.enablePayNow === 'true' || raw.enablePayNow === '1';
  }
  return updateNewsSchema.parse(patch);
}
