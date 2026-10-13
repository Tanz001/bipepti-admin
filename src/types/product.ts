export type StockStatus = 'in_stock' | 'low' | 'out_of_stock';
export type ProductStatus = 'active' | 'draft';

export interface VolumePriceTier {
  minQty: number;
  discountPercent: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  spec: string;
  category: string;
  price: number;
  comparePrice?: number;
  stock: StockStatus;
  purity: number; // e.g. 99.4
  status: ProductStatus;
  featured: boolean;
  image?: string;
  testMethod?: 'HPLC' | 'MS' | 'HPLC / MS' | 'LC-MS';
  casNumber?: string;
  description?: string;
  tags?: string[];
  minOrderQuantity?: number;
  volumePricing?: VolumePriceTier[];
  coaUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'createdAt' | 'name' | 'price' | 'purity' | 'sku';
export type SortDirection = 'asc' | 'desc';

export interface ProductFilterState {
  search: string;
  category: string;
  status: 'all' | 'active' | 'draft' | 'out_of_stock';
  sortBy: 'newest' | 'name-asc' | 'price-asc' | 'price-desc';
  page: number;
  pageSize: number;
  viewMode: 'table' | 'grid';
  groupByProduct: boolean;
}
