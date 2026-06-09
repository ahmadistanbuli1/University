import type { TFunction } from 'i18next';

export function clearanceStatusLabel(status: string, t: TFunction) {
  const key = `clearances.status.${status}` as const;
  return t(key, { defaultValue: status });
}
