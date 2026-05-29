import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
} from '../api/hooks.js';
import { getNotificationDisplay, type NotificationItem } from '../lib/notification-labels.js';
import { cn } from '../lib/cn.js';
import { Button } from './ui/Button.js';

export function NotificationBell() {
  const { t } = useTranslation('nav');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: items = [], isLoading } = useNotificationsQuery(open);
  const { data: unreadCount = 0 } = useUnreadNotificationsCountQuery();
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleClick = (n: NotificationItem) => {
    if (!n.read) {
      markRead.mutate(n.id);
    }
    setOpen(false);
    navigate(n.linkPath);
  };

  const list = (items as NotificationItem[]).slice(0, 20);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="relative rounded-2xl border border-zinc-200/80 bg-white/90 p-2.5 text-brand shadow-sm hover:bg-brand/5 dark:border-white/10 dark:bg-white/5 dark:text-brand-light dark:hover:bg-brand/15"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t('notifications.bellLabel')}
        title={t('notifications.bellLabel')}
      >
        <Bell className="size-[1.15rem]" strokeWidth={1.85} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -end-0.5 -top-0.5 grid min-w-[1.125rem] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-zinc-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-white/10">
              <p className="m-0 text-sm font-bold text-zinc-900 dark:text-white">
                {t('notifications.title')}
              </p>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-brand hover:underline dark:text-brand-light"
                  onClick={() => markAllRead.mutate()}
                >
                  {t('notifications.markAllRead')}
                </button>
              ) : null}
            </div>
            <ul className="max-h-80 list-none overflow-y-auto p-0 m-0">
              {isLoading ? (
                <li className="px-4 py-6 text-center text-sm text-zinc-500">
                  {t('notifications.loading')}
                </li>
              ) : list.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-zinc-500">
                  {t('notifications.empty')}
                </li>
              ) : (
                list.map((n) => {
                  const display = getNotificationDisplay(n, t);
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        className={cn(
                          'w-full border-0 border-b border-zinc-50 px-4 py-3 text-start transition hover:bg-brand/5 dark:border-white/5 dark:hover:bg-brand/10',
                          !n.read && 'bg-brand/5 dark:bg-brand/5'
                        )}
                        onClick={() => handleClick(n)}
                      >
                        <p className="m-0 text-xs font-bold text-zinc-900 dark:text-zinc-50">
                          {display.title}
                        </p>
                        <p className="m-0 mt-0.5 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                          {display.body}
                        </p>
                        <p className="m-0 mt-1 text-[10px] text-zinc-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
