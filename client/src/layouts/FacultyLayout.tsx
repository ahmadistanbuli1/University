import {
  BarChart3,
  BookOpen,
  FileBadge,
  LayoutDashboard,
  PanelsTopLeft,
  PenLine,
  Scale,
  TrendingUp,
} from 'lucide-react';
import { DashboardShell, type NavItem } from './DashboardShell.js';

const navItems: NavItem[] = [
  { to: '/faculty', labelKey: 'faculty.dashboard', icon: LayoutDashboard, end: true },
  { to: '/faculty/classes', labelKey: 'faculty.classes', icon: PanelsTopLeft },
  { to: '/faculty/grades', labelKey: 'faculty.grades', icon: PenLine },
  { to: '/faculty/analytics', labelKey: 'faculty.analytics', icon: BarChart3 },
  { to: '/student/courses', labelKey: 'student.courses', icon: BookOpen, sectionLabelKey: 'faculty.studentPortalSection' },
  { to: '/student/grades', labelKey: 'student.grades', icon: TrendingUp },
  { to: '/student/appeals', labelKey: 'student.appeals', icon: Scale },
  { to: '/student/transcripts', labelKey: 'student.transcripts', icon: FileBadge },
];

export function FacultyLayout() {
  return <DashboardShell titleKey="facultyTitle" navItems={navItems} />;
}
