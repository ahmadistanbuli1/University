import { LayoutDashboard, Newspaper, Percent, Scale, ScrollText, Users } from 'lucide-react';
import { DashboardShell, type NavItem } from './DashboardShell.js';

const navItems: NavItem[] = [
  { to: '/admin', labelKey: 'admin.dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', labelKey: 'admin.users', icon: Users },
  { to: '/admin/students', labelKey: 'admin.studentRecords', icon: Users },
  { to: '/admin/news', labelKey: 'admin.news', icon: Newspaper },
  { to: '/admin/appeals', labelKey: 'admin.appeals', icon: Scale },
  { to: '/admin/discounts', labelKey: 'admin.discounts', icon: Percent },
  { to: '/admin/logs', labelKey: 'admin.logs', icon: ScrollText },
];

export function AdminLayout() {
  return <DashboardShell titleKey="adminTitle" navItems={navItems} />;
}
