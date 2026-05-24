import { ClipboardList, FileBadge, LayoutDashboard, Users } from 'lucide-react';
import { DashboardShell, type NavItem } from './DashboardShell.js';

const navItems: NavItem[] = [
  {
    to: '/exam-officer',
    labelKey: 'examOfficer.dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/exam-officer/transcripts',
    labelKey: 'examOfficer.transcripts',
    icon: FileBadge,
  },
  {
    to: '/exam-officer/grades',
    labelKey: 'examOfficer.grades',
    icon: ClipboardList,
  },
  {
    to: '/exam-officer/students',
    labelKey: 'examOfficer.students',
    icon: Users,
  },
];

export function ExamOfficerLayout() {
  return <DashboardShell titleKey="examOfficerTitle" navItems={navItems} />;
}
