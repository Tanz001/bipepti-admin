import { Product } from '../types/product';
import { SEED_PRODUCTS } from '../data/seedProducts';

const STORAGE_KEY = 'biopepti_catalog_products_v1';

// Simulate realistic async network delay (50-150ms) to mirror a real API
const delay = (ms: number = 80) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStorage(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
      return [...SEED_PRODUCTS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
      return [...SEED_PRODUCTS];
    }
    return parsed;
  } catch (err) {
    console.error('Failed to read products from localStorage:', err);
    return [...SEED_PRODUCTS];
  }
}

function saveStorage(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save products to localStorage:', err);
  }
}

/**
 * Fetch all catalog products
 */
export async function getProducts(): Promise<Product[]> {
  await delay(60);
  return loadStorage();
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  await delay(40);
  const items = loadStorage();
  return items.find((p) => p.id === id) || null;
}

/**
 * Create a new product
 */
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Product> {
  await delay(120);
  const items = loadStorage();

  // Validate unique SKU
  const existingSku = items.find((p) => p.sku.trim().toUpperCase() === data.sku.trim().toUpperCase());
  if (existingSku) {
    throw new Error(`SKU "${data.sku}" is already in use by ${existingSku.name}`);
  }

  const newId = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newProduct: Product = {
    ...data,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newProduct, ...items];
  saveStorage(updated);
  return newProduct;
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<Product> {
  await delay(100);
  const items = loadStorage();
  const index = items.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error(`Product with ID "${id}" was not found.`);
  }

  // If SKU is changed, check uniqueness
  if (updates.sku && updates.sku.trim().toUpperCase() !== items[index].sku.trim().toUpperCase()) {
    const existing = items.find(
      (p) => p.id !== id && p.sku.trim().toUpperCase() === updates.sku!.trim().toUpperCase()
    );
    if (existing) {
      throw new Error(`SKU "${updates.sku}" is already used by ${existing.name}`);
    }
  }

  const updatedItem: Product = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  items[index] = updatedItem;
  saveStorage(items);
  return updatedItem;
}

/**
 * Delete a single product
 */
export async function deleteProduct(id: string): Promise<void> {
  await delay(80);
  const items = loadStorage();
  const filtered = items.filter((p) => p.id !== id);
  if (filtered.length === items.length) {
    throw new Error(`Product with ID "${id}" was not found.`);
  }
  saveStorage(filtered);
}

/**
 * Restore a deleted product (e.g. for 5-second undo)
 */
export async function restoreProduct(product: Product): Promise<Product> {
  await delay(50);
  const items = loadStorage();
  const exists = items.some((p) => p.id === product.id);
  if (!exists) {
    items.unshift(product);
    saveStorage(items);
  }
  return product;
}

/**
 * Bulk update product status
 */
export async function bulkUpdateStatus(
  ids: string[],
  status: 'active' | 'draft'
): Promise<Product[]> {
  await delay(100);
  const items = loadStorage();
  const now = new Date().toISOString();
  const idSet = new Set(ids);

  const updated = items.map((p) => {
    if (idSet.has(p.id)) {
      return { ...p, status, updatedAt: now };
    }
    return p;
  });

  saveStorage(updated);
  return updated.filter((p) => idSet.has(p.id));
}

/**
 * Bulk update product category
 */
export async function bulkUpdateCategory(
  ids: string[],
  category: string
): Promise<Product[]> {
  await delay(100);
  const items = loadStorage();
  const now = new Date().toISOString();
  const idSet = new Set(ids);

  const updated = items.map((p) => {
    if (idSet.has(p.id)) {
      return { ...p, category, updatedAt: now };
    }
    return p;
  });

  saveStorage(updated);
  return updated.filter((p) => idSet.has(p.id));
}

/**
 * Bulk delete products
 */
export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  await delay(120);
  const items = loadStorage();
  const idSet = new Set(ids);
  const remaining = items.filter((p) => !idSet.has(p.id));
  saveStorage(remaining);
}

/**
 * Import batch of products from CSV/JSON
 */
export async function importProducts(
  incoming: Partial<Product>[]
): Promise<{ importedCount: number; errors: string[] }> {
  await delay(200);
  const current = loadStorage();
  const existingSkus = new Set(current.map((p) => p.sku.toUpperCase()));
  const errors: string[] = [];
  const toAdd: Product[] = [];
  const now = new Date().toISOString();

  incoming.forEach((row, idx) => {
    const rowNum = idx + 1;
    if (!row.name || !row.name.trim()) {
      errors.push(`Row ${rowNum}: Name is required.`);
      return;
    }
    if (!row.sku || !row.sku.trim()) {
      errors.push(`Row ${rowNum}: SKU is required.`);
      return;
    }
    const cleanSku = row.sku.trim().toUpperCase();
    if (existingSkus.has(cleanSku)) {
      errors.push(`Row ${rowNum}: Duplicate SKU "${cleanSku}" already exists.`);
      return;
    }

    existingSkus.add(cleanSku);
    const priceNum = typeof row.price === 'number' ? row.price : parseFloat(String(row.price || 0));

    toAdd.push({
      id: `prod-imp-${Date.now().toString(36)}-${idx}`,
      sku: cleanSku,
      name: row.name.trim(),
      spec: (row.spec || '5mg*10vials').trim(),
      category: (row.category || 'Specialty Research').trim(),
      price: isNaN(priceNum) || priceNum <= 0 ? 99 : priceNum,
      comparePrice: row.comparePrice ? Number(row.comparePrice) : undefined,
      stock: (row.stock as any) || 'in_stock',
      purity: typeof row.purity === 'number' ? row.purity : 99.5,
      status: (row.status as any) || 'active',
      featured: Boolean(row.featured),
      image: row.image || undefined,
      description: row.description || '',
      tags: Array.isArray(row.tags) ? row.tags : [],
      createdAt: now,
      updatedAt: now,
    });
  });

  if (toAdd.length > 0) {
    const combined = [...toAdd, ...current];
    saveStorage(combined);
  }

  return { importedCount: toAdd.length, errors };
}

/**
 * Reset dataset back to fresh seed products
 */
export async function resetToSeed(): Promise<Product[]> {
  await delay(150);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
  return [...SEED_PRODUCTS];
}
