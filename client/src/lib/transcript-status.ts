import type { TFunction } from 'i18next';

export function transcriptStatusLabel(status: string, t: TFunction) {
  const key = `transcripts.status.${status}` as const;
  const label = t(key);
  return label === key ? status : label;
}
