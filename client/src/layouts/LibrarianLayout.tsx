import { BookMarked, LayoutDashboard } from 'lucide-react';
import { DashboardShell, type NavItem } from './DashboardShell.js';

const navItems: NavItem[] = [
  { to: '/librarian', labelKey: 'librarian.dashboard', icon: LayoutDashboard, end: true },
  { to: '/librarian/books', labelKey: 'librarian.books', icon: BookMarked },
];

export function LibrarianLayout() {
  return <DashboardShell titleKey="librarianTitle" navItems={navItems} />;
}
