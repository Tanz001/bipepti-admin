import { apiRequest, resolveMediaUrl } from './api';
import type { Product, ProductVariant } from '../types/product';
import { CATEGORIES } from '../data/seedProducts';

interface ProductsListResponse {
  success: boolean;
  products: Product[];
  categories?: string[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface ProductResponse {
  success: boolean;
  product: Product;
  message?: string;
}

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    image: resolveMediaUrl(p.image),
    featured: Boolean(p.featured),
    variants: (p.variants || []).map((v: ProductVariant) => ({
      ...v,
      price: Number(v.price),
    })),
    price: p.price != null ? Number(p.price) : undefined,
    purity: p.purity != null ? Number(p.purity) : undefined,
  };
}

export type ProductInput = {
  name: string;
  sku: string;
  category: string;
  description?: string;
  status?: 'active' | 'draft';
  featured?: boolean;
  purity?: number;
  buyLink?: string;
  variants: ProductVariant[];
  /** Existing server image path (keep when not uploading a new file) */
  image?: string;
};

function buildFormData(data: ProductInput, imageFile?: File | null): FormData {
  const form = new FormData();
  form.append('name', data.name);
  form.append('sku', data.sku);
  form.append('category', data.category);
  form.append('status', data.status || 'active');
  form.append('featured', data.featured ? 'true' : 'false');
  if (data.description != null) form.append('description', data.description);
  if (data.purity != null) form.append('purity', String(data.purity));
  if (data.buyLink != null) form.append('buyLink', data.buyLink);
  form.append(
    'variants',
    JSON.stringify(
      data.variants.map((v) => ({
        id: v.id,
        strength: v.strength,
        price: v.price,
        stock: v.stock,
        sku: v.sku || undefined,
      }))
    )
  );

  if (imageFile) {
    form.append('image', imageFile);
  }

  return form;
}

export async function getProducts(): Promise<Product[]> {
  const data = await apiRequest<ProductsListResponse>('/api/products?pageSize=100');
  return (data.products || []).map(normalizeProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const data = await apiRequest<ProductResponse>(`/api/products/${id}`);
    return normalizeProduct(data.product);
  } catch {
    return null;
  }
}

export async function createProduct(
  data: ProductInput,
  imageFile?: File | null
): Promise<Product> {
  const form = buildFormData(data, imageFile);
  const res = await apiRequest<ProductResponse>('/api/products', {
    method: 'POST',
    formData: form,
  });
  return normalizeProduct(res.product);
}

export async function updateProduct(
  id: string,
  updates: Partial<ProductInput>,
  imageFile?: File | null
): Promise<Product> {
  // Prefer multipart when uploading a file or sending variants
  const form = new FormData();
  if (updates.name != null) form.append('name', updates.name);
  if (updates.sku != null) form.append('sku', updates.sku);
  if (updates.category != null) form.append('category', updates.category);
  if (updates.description != null) form.append('description', updates.description);
  if (updates.status != null) form.append('status', updates.status);
  if (updates.featured != null) form.append('featured', updates.featured ? 'true' : 'false');
  if (updates.purity != null) form.append('purity', String(updates.purity));
  if (updates.buyLink != null) form.append('buyLink', updates.buyLink);
  if (updates.variants) {
    form.append(
      'variants',
      JSON.stringify(
        updates.variants.map((v) => ({
          id: v.id,
          strength: v.strength,
          price: v.price,
          stock: v.stock,
          sku: v.sku || undefined,
        }))
      )
    );
  }
  if (imageFile) form.append('image', imageFile);

  const res = await apiRequest<ProductResponse>(`/api/products/${id}`, {
    method: 'PUT',
    formData: form,
  });
  return normalizeProduct(res.product);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
}

/** Re-create a deleted product (used for undo). */
export async function restoreProduct(product: Product): Promise<Product> {
  return createProduct({
    name: product.name,
    sku: product.sku,
    category: product.category,
    description: product.description,
    status: product.status,
    featured: product.featured,
    purity: product.purity,
    variants: product.variants || [],
  });
}

export async function bulkUpdateStatus(
  ids: string[],
  status: 'active' | 'draft'
): Promise<Product[]> {
  const results: Product[] = [];
  for (const id of ids) {
    results.push(await updateProduct(id, { status }));
  }
  return results;
}

export async function bulkUpdateCategory(ids: string[], category: string): Promise<Product[]> {
  const results: Product[] = [];
  for (const id of ids) {
    results.push(await updateProduct(id, { category }));
  }
  return results;
}

export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  for (const id of ids) {
    await deleteProduct(id);
  }
}

export async function importProducts(
  incoming: Partial<Product>[]
): Promise<{ importedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let importedCount = 0;

  for (let i = 0; i < incoming.length; i++) {
    const row = incoming[i];
    const rowNum = i + 1;
    try {
      if (!row.name?.trim() || !row.sku?.trim()) {
        errors.push(`Row ${rowNum}: Name and SKU are required.`);
        continue;
      }
      await createProduct({
        name: row.name.trim(),
        sku: row.sku.trim().toUpperCase(),
        category: row.category || CATEGORIES[0],
        description: row.description,
        status: row.status || 'active',
        featured: Boolean(row.featured),
        variants:
          row.variants && row.variants.length > 0
            ? row.variants
            : [
                {
                  id: `var-imp-${Date.now()}-${i}`,
                  strength: row.spec || '5mg',
                  price: Number(row.price) || 99,
                  stock: (row.stock as ProductVariant['stock']) || 'in_stock',
                },
              ],
      });
      importedCount++;
    } catch (e: any) {
      errors.push(`Row ${rowNum}: ${e?.message || 'Import failed'}`);
    }
  }

  return { importedCount, errors };
}

export async function resetToSeed(): Promise<Product[]> {
  throw new Error('Reset to seed is not available with the MySQL API. Use npm run seed on the backend.');
}

export { CATEGORIES };
