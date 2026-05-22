import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

type SidebarNavItemProps = {
  to: string;
  end?: boolean;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
};

export function SidebarNavItem({ to, end, label, icon: Icon, collapsed }: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end ?? false}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center rounded-2xl text-sm font-semibold outline-none transition-[background-color,color,box-shadow] duration-200',
          collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
          isActive
            ? 'bg-gradient-to-r from-violet-600 to-violet-400 text-white shadow-md shadow-violet-600/25 ring-1 ring-violet-500/20'
            : 'text-zinc-600 hover:bg-violet-50 hover:text-violet-800 dark:text-zinc-400 dark:hover:bg-violet-500/12 dark:hover:text-violet-100'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-200',
              isActive
                ? 'bg-white/20 text-white'
                : 'bg-violet-100/0 text-inherit group-hover:bg-violet-100/80 group-hover:text-violet-700 dark:group-hover:bg-violet-500/15 dark:group-hover:text-violet-200'
            )}
          >
            <Icon className="size-[1.25rem]" strokeWidth={1.85} aria-hidden />
          </span>
          {!collapsed ? (
            <motion.span
              className="min-w-0 flex-1 truncate"
              initial={false}
              animate={{ opacity: 1, width: 'auto' }}
              transition={{ duration: 0.15 }}
            >
              {label}
            </motion.span>
          ) : null}
          {isActive && !collapsed ? (
            <span
              className="absolute inset-y-2 start-0 w-1 rounded-full bg-white/90"
              aria-hidden
            />
          ) : null}
        </>
      )}
    </NavLink>
  );
}
