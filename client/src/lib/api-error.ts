import { isAxiosError } from 'axios';
import { toast } from 'sonner';

export type FacultyCourseConflictDetail = {
  courseId: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  facultyEmail: string;
};

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!isAxiosError(err)) return fallback;
  const body = err.response?.data as
    | {
        error?: string;
        details?: { conflicts?: FacultyCourseConflictDetail[] };
      }
    | undefined;
  if (!body?.error) return fallback;

  const conflicts = body.details?.conflicts;
  if (conflicts?.length) {
    const lines = conflicts.map(
      (c) => `• ${c.courseName} (${c.courseCode}) → ${c.facultyName}`
    );
    return `${body.error}\n${lines.join('\n')}`;
  }
  return body.error;
}

export function apiErrorToast(err: unknown, fallback: string) {
  toast.error(getApiErrorMessage(err, fallback));
}
