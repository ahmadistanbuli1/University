import { BookOpen, Inbox, LayoutDashboard, Megaphone, Users } from 'lucide-react';
import { DashboardShell, type NavItem } from './DashboardShell.js';

const navItems: NavItem[] = [
  { to: '/manager', labelKey: 'manager.dashboard', icon: LayoutDashboard, end: true },
  { to: '/manager/curriculum', labelKey: 'manager.curriculum', icon: BookOpen },
  { to: '/manager/students', labelKey: 'manager.students', icon: Users },
  { to: '/manager/requests', labelKey: 'manager.requests', icon: Inbox },
  { to: '/manager/news', labelKey: 'manager.news', icon: Megaphone },
];

export function ManagerLayout() {
  return <DashboardShell titleKey="managerTitle" navItems={navItems} />;
}
