import { BookOpen, FileBadge, LayoutDashboard, Scale, TrendingUp } from 'lucide-react';
import { DashboardShell, type NavItem } from './DashboardShell.js';

const navItems: NavItem[] = [
  { to: '/student', labelKey: 'student.dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/courses', labelKey: 'student.courses', icon: BookOpen },
  { to: '/student/grades', labelKey: 'student.grades', icon: TrendingUp },
  { to: '/student/appeals', labelKey: 'student.appeals', icon: Scale },
  { to: '/student/transcripts', labelKey: 'student.transcripts', icon: FileBadge },
];

export function StudentLayout() {
  return <DashboardShell titleKey="studentTitle" navItems={navItems} />;
}
