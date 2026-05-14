import { FileBadge, LayoutDashboard } from 'lucide-react';
import { DashboardShell, type NavItem } from './DashboardShell.js';

const navItems: NavItem[] = [
  { to: '/affairs', labelKey: 'affairs.dashboard', icon: LayoutDashboard, end: true },
  { to: '/affairs/transcripts', labelKey: 'affairs.transcripts', icon: FileBadge },
];

export function AffairsLayout() {
  return <DashboardShell titleKey="affairsTitle" navItems={navItems} />;
}
