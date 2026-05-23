import { BarChart3, LayoutDashboard, PanelsTopLeft, PenLine } from 'lucide-react';
import { DashboardShell, type NavItem } from './DashboardShell.js';

const navItems: NavItem[] = [
  { to: '/faculty', labelKey: 'faculty.profile', icon: LayoutDashboard, end: true },
  { to: '/faculty/classes', labelKey: 'faculty.courses', icon: PanelsTopLeft },
  { to: '/faculty/grades', labelKey: 'faculty.grades', icon: PenLine },
  { to: '/faculty/analytics', labelKey: 'faculty.analytics', icon: BarChart3 },
];

export function FacultyLayout() {
  return <DashboardShell titleKey="facultyTitle" navItems={navItems} />;
}
