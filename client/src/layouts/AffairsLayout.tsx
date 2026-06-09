import {
  ClipboardList,
  FileBadge,
  FileCheck,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { DashboardShell, type NavItem } from './DashboardShell.js';

const navItems: NavItem[] = [
  { to: '/affairs', labelKey: 'affairs.dashboard', icon: LayoutDashboard, end: true },
  { to: '/affairs/students', labelKey: 'affairs.students', icon: Users },
  { to: '/affairs/transcripts', labelKey: 'affairs.transcripts', icon: FileBadge },
  { to: '/affairs/clearances', labelKey: 'affairs.clearances', icon: FileCheck },
  { to: '/affairs/activity', labelKey: 'affairs.activity', icon: ClipboardList },
];

export function AffairsLayout() {
  return <DashboardShell titleKey="affairsTitle" navItems={navItems} />;
}
