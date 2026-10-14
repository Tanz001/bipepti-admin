import { apiRequest, resolveMediaUrl } from './api';
import type { Product } from '../types/product';

export interface DashboardStats {
  total: number;
  active: number;
  draft: number;
  outOfStock: number;
  categoriesCount: number;
  variantsCount: number;
}

interface StatsResponse {
  success: boolean;
  stats: DashboardStats;
  recentProducts: Array<{
    id: string;
    sku: string;
    name: string;
    category: string;
    status: 'active' | 'draft';
    image: string | null;
    updatedAt: string;
    variants: Array<{ strength: string; price: number; stock: string }>;
  }>;
}

export async function fetchStats(): Promise<{
  stats: DashboardStats;
  recentProducts: Product[];
}> {
  const data = await apiRequest<StatsResponse>('/api/stats');

  const recentProducts: Product[] = (data.recentProducts || []).map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    status: p.status,
    featured: false,
    image: resolveMediaUrl(p.image),
    updatedAt: p.updatedAt,
    createdAt: p.updatedAt,
    variants: (p.variants || []).map((v, i) => ({
      id: `${p.id}-rv-${i}`,
      strength: v.strength,
      price: Number(v.price),
      stock: v.stock as Product['variants'][0]['stock'],
    })),
  }));

  return { stats: data.stats, recentProducts };
}
