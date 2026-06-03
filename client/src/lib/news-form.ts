export type NewsPublishPayload = {
  title: string;
  content: string;
  imageUrl?: string | null;
  collegeId?: string | null;
  category?: 'ANNOUNCEMENT' | 'WORKSHOP' | 'TRAINING' | 'TUITION';
  enablePayNow?: boolean;
  tuitionSemesterKey?: 'semester-1' | 'semester-2' | null;
  scope?: 'COLLEGE' | 'UNIVERSITY';
};

export function buildNewsFormData(body: NewsPublishPayload, imageFile?: File | null): FormData {
  const fd = new FormData();
  fd.append('title', body.title);
  fd.append('content', body.content);
  if (body.category) fd.append('category', body.category);
  if (body.collegeId) fd.append('collegeId', body.collegeId);
  if (body.scope) fd.append('scope', body.scope);
  if (body.enablePayNow != null) fd.append('enablePayNow', String(body.enablePayNow));
  if (body.tuitionSemesterKey) fd.append('tuitionSemesterKey', body.tuitionSemesterKey);
  if (body.tuitionSemesterKey === null) fd.append('tuitionSemesterKey', '');
  if (body.imageUrl !== undefined) fd.append('imageUrl', body.imageUrl ?? '');
  if (imageFile) fd.append('image', imageFile);
  return fd;
}
