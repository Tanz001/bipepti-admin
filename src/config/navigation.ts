import { LucideIcon, Package, ShoppingCart, FileText, ShieldCheck, Users, Settings } from 'lucide-react';

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeType?: 'count' | 'pill';
  enabled?: boolean;
}

export const SIDEBAR_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'products',
    label: 'Products',
    href: '/admin/products',
    icon: Package,
    badgeType: 'count', // dynamic product count
    enabled: true,
  },
  {
    id: 'orders',
    label: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: '14',
    badgeType: 'pill',
    enabled: true,
  },
  {
    id: 'quotes',
    label: 'Quotes',
    href: '/admin/quotes',
    icon: FileText,
    badge: '3',
    badgeType: 'pill',
    enabled: true,
  },
  {
    id: 'coa',
    label: 'COA Reports',
    href: '/admin/coa',
    icon: ShieldCheck,
    enabled: true,
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/admin/customers',
    icon: Users,
    enabled: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    enabled: true,
  },
];
