import { LayoutDashboard, Megaphone } from 'lucide-react';
import { DashboardShell, type NavItem } from './DashboardShell.js';

const navItems: NavItem[] = [
  { to: '/manager', labelKey: 'manager.dashboard', icon: LayoutDashboard, end: true },
  { to: '/manager/news', labelKey: 'manager.news', icon: Megaphone },
];

export function ManagerLayout() {
  return <DashboardShell titleKey="managerTitle" navItems={navItems} />;
}
