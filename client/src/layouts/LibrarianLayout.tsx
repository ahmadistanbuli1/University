import { BookMarked, LayoutDashboard, Newspaper } from 'lucide-react';
import { DashboardShell, type NavItem } from './DashboardShell.js';

const navItems: NavItem[] = [
  { to: '/librarian', labelKey: 'librarian.dashboard', icon: LayoutDashboard, end: true },
  { to: '/librarian/books', labelKey: 'librarian.books', icon: BookMarked },
  { to: '/librarian/news', labelKey: 'librarian.news', icon: Newspaper },
];

export function LibrarianLayout() {
  return <DashboardShell titleKey="librarianTitle" navItems={navItems} />;
}
