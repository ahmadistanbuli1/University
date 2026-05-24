import type { TFunction } from 'i18next';

export function gradeSubmissionStatusLabel(status: string, t: TFunction) {
  const key = `gradeSubmissions.status.${status}` as const;
  const label = t(key);
  return label === key ? status : label;
}
