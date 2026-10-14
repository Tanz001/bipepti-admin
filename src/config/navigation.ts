import { LucideIcon, LayoutDashboard, Package, Settings } from 'lucide-react';

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badgeType?: 'count';
}

export const SIDEBAR_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'products',
    label: 'Products',
    href: '/admin/products',
    icon: Package,
    badgeType: 'count',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function getNavLabel(pathname: string): string {
  const match = SIDEBAR_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  return match?.label ?? 'Admin';
}
