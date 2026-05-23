import type { TFunction } from 'i18next';

export type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  linkPath: string;
  meta?: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
};

export function getNotificationDisplay(n: NotificationItem, t: TFunction) {
  const meta = (n.meta ?? {}) as Record<string, string>;
  const base = `notifications.kinds.${n.kind}`;
  return {
    title: t(`${base}.title`, { ...meta, defaultValue: n.title }),
    body: t(`${base}.body`, { ...meta, defaultValue: n.body }),
  };
}
