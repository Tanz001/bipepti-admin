export type StockStatus = 'in_stock' | 'low' | 'out_of_stock';
export type ProductStatus = 'active' | 'draft';

/** One strength / quantity option with its own price (e.g. 5mg, 10mg, 20mg). */
export interface ProductVariant {
  id: string;
  strength: string;
  price: number;
  stock: StockStatus;
  sku?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  variants: ProductVariant[];
  /** @deprecated Kept for migration / display fallback — prefer variants */
  spec?: string;
  /** @deprecated Prefer variants[0].price or getPriceRange() */
  price?: number;
  stock?: StockStatus;
  purity?: number;
  status: ProductStatus;
  featured: boolean;
  image?: string;
  description?: string;
  /** External URL opened by Buy Now on the landing site */
  buyLink?: string;
  createdAt: string;
  updatedAt: string;
}

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

export function getProductVariants(product: Product): ProductVariant[] {
  if (product.variants && product.variants.length > 0) {
    return product.variants;
  }
  // Legacy single-spec products
  return [
    {
      id: `${product.id}-legacy`,
      strength: product.spec || 'Standard',
      price: product.price ?? 0,
      stock: product.stock || 'in_stock',
      sku: product.sku,
    },
  ];
}

export function getPriceRange(product: Product): { min: number; max: number } {
  const variants = getProductVariants(product);
  const prices = variants.map((v) => v.price).filter((p) => Number.isFinite(p));
  if (prices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function formatPriceRange(product: Product): string {
  const { min, max } = getPriceRange(product);
  if (min === max) return `$${min.toFixed(2)}`;
  return `$${min.toFixed(2)} – $${max.toFixed(2)}`;
}

export function getStrengthsLabel(product: Product): string {
  return getProductVariants(product)
    .map((v) => v.strength)
    .join(', ');
}

export function getOverallStock(product: Product): StockStatus {
  const variants = getProductVariants(product);
  if (variants.some((v) => v.stock === 'in_stock')) return 'in_stock';
  if (variants.some((v) => v.stock === 'low')) return 'low';
  return 'out_of_stock';
}

export function createVariantId(): string {
  return `var-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
