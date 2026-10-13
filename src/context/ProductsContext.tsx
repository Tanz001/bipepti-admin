import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { Product, ProductFilterState, StockStatus } from '../types/product';
import * as productsApi from '../lib/productsApi';
import { useToast } from './ToastContext';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;

  // Filters & Pagination
  filters: ProductFilterState;
  setSearch: (term: string) => void;
  setCategory: (category: string) => void;
  setStatus: (status: ProductFilterState['status']) => void;
  setSortBy: (sort: ProductFilterState['sortBy']) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setViewMode: (mode: 'table' | 'grid') => void;
  setGroupByProduct: (group: boolean) => void;
  resetFilters: () => void;

  // Filtered & Grouped results
  filteredProducts: Product[];
  paginatedProducts: Product[];
  totalFilteredCount: number;
  totalPages: number;
  allCategories: string[];

  // Selection & Bulk Actions
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isAllSelected: boolean;
  bulkSetActive: () => Promise<void>;
  bulkSetDraft: () => Promise<void>;
  bulkChangeCategory: (cat: string) => Promise<void>;
  bulkDelete: () => Promise<void>;

  // CRUD Operations
  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (product: Product) => Promise<void>;
  toggleProductStatus: (id: string) => Promise<void>;
  resetCatalogToSeed: () => Promise<void>;

  // Drawer (Add / Edit)
  isDrawerOpen: boolean;
  editingProduct: Product | null;
  openAddDrawer: () => void;
  openEditDrawer: (product: Product) => void;
  closeDrawer: () => void;

  // Modals
  deletingProduct: Product | null;
  openDeleteModal: (product: Product) => void;
  closeDeleteModal: () => void;
  confirmDeleteProduct: () => Promise<void>;

  isImportModalOpen: boolean;
  openImportModal: () => void;
  closeImportModal: () => void;
  importFromCsv: (rows: Partial<Product>[]) => Promise<{ count: number; errors: string[] }>;

  // Quick stats
  stats: {
    total: number;
    active: number;
    draft: number;
    categoriesCount: number;
    outOfStock: number;
  };
}

const defaultFilters: ProductFilterState = {
  search: '',
  category: 'all',
  status: 'all',
  sortBy: 'newest',
  page: 1,
  pageSize: 10,
  viewMode: 'table',
  groupByProduct: true,
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProductFilterState>(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Import modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { showSuccess, showError, showUndoToast } = useToast();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load catalog');
      showError('Error loading products', err?.message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Categories list
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filter handlers
  const setSearch = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, search: term, page: 1 }));
  }, []);

  const setCategory = useCallback((cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat, page: 1 }));
  }, []);

  const setStatus = useCallback((status: ProductFilterState['status']) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setSortBy = useCallback((sortBy: ProductFilterState['sortBy']) => {
    setFilters((prev) => ({ ...prev, sortBy, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setViewMode = useCallback((viewMode: 'table' | 'grid') => {
    setFilters((prev) => ({ ...prev, viewMode }));
  }, []);

  const setGroupByProduct = useCallback((groupByProduct: boolean) => {
    setFilters((prev) => ({ ...prev, groupByProduct }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters((prev) => ({
      ...defaultFilters,
      viewMode: prev.viewMode,
      pageSize: prev.pageSize,
    }));
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query: name, SKU, spec, description
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.spec.toLowerCase().includes(q) ||
          (p.casNumber && p.casNumber.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'out_of_stock') {
        result = result.filter((p) => p.stock === 'out_of_stock');
      } else {
        result = result.filter((p) => p.status === filters.status);
      }
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [products, filters.search, filters.category, filters.status, filters.sortBy]);

  // Paginated list
  const totalFilteredCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / filters.pageSize));

  const paginatedProducts = useMemo(() => {
    const startIndex = (filters.page - 1) * filters.pageSize;
    return filteredProducts.slice(startIndex, startIndex + filters.pageSize);
  }, [filteredProducts, filters.page, filters.pageSize]);

  // Selection handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(paginatedProducts.map((p) => p.id));
  }, [paginatedProducts]);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isAllSelected = useMemo(() => {
    if (paginatedProducts.length === 0) return false;
    return paginatedProducts.every((p) => selectedIds.includes(p.id));
  }, [paginatedProducts, selectedIds]);

  // Bulk actions
  const bulkSetActive = useCallback(async () => {
    if (selectedIds.length === 0) return;
    try {
      await productsApi.bulkUpdateStatus(selectedIds, 'active');
      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, status: 'active' } : p))
      );
      showSuccess(`Updated ${selectedIds.length} products to Active`);
      setSelectedIds([]);
    } catch (e: any) {
      showError('Failed to bulk update status', e?.message);
    }
  }, [selectedIds, showSuccess, showError]);

  const bulkSetDraft = useCallback(async () => {
    if (selectedIds.length === 0) return;
    try {
      await productsApi.bulkUpdateStatus(selectedIds, 'draft');
      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, status: 'draft' } : p))
      );
      showSuccess(`Updated ${selectedIds.length} products to Draft`);
      setSelectedIds([]);
    } catch (e: any) {
      showError('Failed to bulk update status', e?.message);
    }
  }, [selectedIds, showSuccess, showError]);

  const bulkChangeCategory = useCallback(
    async (newCat: string) => {
      if (selectedIds.length === 0) return;
      try {
        await productsApi.bulkUpdateCategory(selectedIds, newCat);
        setProducts((prev) =>
          prev.map((p) => (selectedIds.includes(p.id) ? { ...p, category: newCat } : p))
        );
        showSuccess(`Changed category for ${selectedIds.length} products to ${newCat}`);
        setSelectedIds([]);
      } catch (e: any) {
        showError('Failed to bulk update category', e?.message);
      }
    },
    [selectedIds, showSuccess, showError]
  );

  const bulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    try {
      await productsApi.bulkDeleteProducts(selectedIds);
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      showSuccess(`Deleted ${count} products`);
      setSelectedIds([]);
    } catch (e: any) {
      showError('Failed to delete products', e?.message);
    }
  }, [selectedIds, showSuccess, showError]);

  // Single CRUD
  const createProduct = useCallback(
    async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const created = await productsApi.createProduct(data);
        setProducts((prev) => [created, ...prev]);
        showSuccess(`Product "${created.name}" created`, `SKU: ${created.sku}`);
        return created;
      } catch (e: any) {
        showError('Failed to create product', e?.message);
        throw e;
      }
    },
    [showSuccess, showError]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      try {
        const updated = await productsApi.updateProduct(id, updates);
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        showSuccess('Product saved', `Updated ${updated.name} (${updated.sku})`);
        return updated;
      } catch (e: any) {
        showError('Failed to update product', e?.message);
        throw e;
      }
    },
    [showSuccess, showError]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const target = products.find((p) => p.id === id);
      if (!target) return;

      try {
        await productsApi.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));

        // 5-second undo toast as requested!
        showUndoToast(
          `Deleted "${target.name} ${target.spec}"`,
          async () => {
            try {
              const restored = await productsApi.restoreProduct(target);
              setProducts((prev) => [restored, ...prev]);
              showSuccess(`Restored "${target.name}"`);
            } catch (err: any) {
              showError('Failed to restore product', err?.message);
            }
          },
          5000
        );
      } catch (e: any) {
        showError('Failed to delete product', e?.message);
      }
    },
    [products, showUndoToast, showSuccess, showError]
  );

  const duplicateProduct = useCallback(
    async (product: Product) => {
      const baseSku = product.sku.replace(/-COPY(-\d+)?$/, '');
      const newSku = `${baseSku}-COPY`;

      const duplicatePayload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        ...product,
        name: `${product.name} (Copy)`,
        sku: newSku,
        status: 'draft',
      };

      try {
        const created = await productsApi.createProduct(duplicatePayload);
        setProducts((prev) => [created, ...prev]);
        showSuccess(`Duplicated ${product.name}`, `Created draft ${newSku}`);
        setEditingProduct(created);
        setIsDrawerOpen(true);
      } catch (e: any) {
        showError('Failed to duplicate product', e?.message);
      }
    },
    [showSuccess, showError]
  );

  const toggleProductStatus = useCallback(
    async (id: string) => {
      const target = products.find((p) => p.id === id);
      if (!target) return;
      const nextStatus = target.status === 'active' ? 'draft' : 'active';

      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );

      try {
        await productsApi.updateProduct(id, { status: nextStatus });
        showSuccess(`Status changed to ${nextStatus === 'active' ? 'Active' : 'Draft'}`, `${target.name} (${target.sku})`);
      } catch (e: any) {
        // Rollback
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: target.status } : p))
        );
        showError('Failed to update status', e?.message);
      }
    },
    [products, showSuccess, showError]
  );

  const resetCatalogToSeed = useCallback(async () => {
    try {
      const fresh = await productsApi.resetToSeed();
      setProducts(fresh);
      setSelectedIds([]);
      showSuccess('Catalog reset to sample seeds', '30 realistic peptide products restored.');
    } catch (e: any) {
      showError('Failed to reset catalog', e?.message);
    }
  }, [showSuccess, showError]);

  // Drawer handlers
  const openAddDrawer = useCallback(() => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  }, []);

  const openEditDrawer = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
  }, []);

  // Delete modal handlers
  const openDeleteModal = useCallback((product: Product) => {
    setDeletingProduct(product);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeletingProduct(null);
  }, []);

  const confirmDeleteProduct = useCallback(async () => {
    if (!deletingProduct) return;
    const target = deletingProduct;
    closeDeleteModal();
    await deleteProduct(target.id);
  }, [deletingProduct, closeDeleteModal, deleteProduct]);

  // CSV Import
  const openImportModal = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  const closeImportModal = useCallback(() => {
    setIsImportModalOpen(false);
  }, []);

  const importFromCsv = useCallback(
    async (rows: Partial<Product>[]) => {
      const res = await productsApi.importProducts(rows);
      if (res.importedCount > 0) {
        await loadProducts();
        showSuccess(`Imported ${res.importedCount} products successfully.`);
      }
      return { count: res.importedCount, errors: res.errors };
    },
    [loadProducts, showSuccess]
  );

  // Quick stats
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === 'active').length;
    const draft = products.filter((p) => p.status === 'draft').length;
    const outOfStock = products.filter((p) => p.stock === 'out_of_stock').length;
    const uniqueCats = new Set(products.map((p) => p.category)).size;

    return {
      total,
      active,
      draft,
      categoriesCount: uniqueCats,
      outOfStock,
    };
  }, [products]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts: loadProducts,
        filters,
        setSearch,
        setCategory,
        setStatus,
        setSortBy,
        setPage,
        setPageSize,
        setViewMode,
        setGroupByProduct,
        resetFilters,
        filteredProducts,
        paginatedProducts,
        totalFilteredCount,
        totalPages,
        allCategories,
        selectedIds,
        toggleSelect,
        selectAll,
        deselectAll,
        isAllSelected,
        bulkSetActive,
        bulkSetDraft,
        bulkChangeCategory,
        bulkDelete,
        createProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        toggleProductStatus,
        resetCatalogToSeed,
        isDrawerOpen,
        editingProduct,
        openAddDrawer,
        openEditDrawer,
        closeDrawer,
        deletingProduct,
        openDeleteModal,
        closeDeleteModal,
        confirmDeleteProduct,
        isImportModalOpen,
        openImportModal,
        closeImportModal,
        importFromCsv,
        stats,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = (): ProductsContextType => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
