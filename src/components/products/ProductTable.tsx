import React, { useState } from 'react';
import {
  Copy,
  Check,
  MoreVertical,
  Edit2,
  CopyPlus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Layers,
  ArrowUpDown,
  SearchX,
  PackageOpen,
  Plus,
  ChevronLeft,
} from 'lucide-react';
import { Product, StockStatus } from '../../types/product';
import { useProducts } from '../../context/ProductsContext';
import { useToast } from '../../context/ToastContext';

// Copy SKU with inline indicator
const CopySkuButton: React.FC<{ sku: string }> = ({ sku }) => {
  const [copied, setCopied] = useState(false);
  const { showSuccess } = useToast();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopied(true);
    showSuccess(`Copied SKU: ${sku}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="group/sku inline-flex items-center gap-1 font-mono text-xs text-[#0A2358] hover:text-[#1C7FDB] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-[#EAF3FD] transition-colors"
      title="Click to copy SKU"
    >
      <span>{sku}</span>
      {copied ? (
        <Check className="w-3 h-3 text-[#12B8A6]" />
      ) : (
        <Copy className="w-3 h-3 text-[#5F7088] opacity-0 group-hover/sku:opacity-100 transition-opacity" />
      )}
    </button>
  );
};

// Stock status pill styling
const StockStatusBadge: React.FC<{ status: StockStatus }> = ({ status }) => {
  if (status === 'in_stock') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
        In Stock
      </span>
    );
  }
  if (status === 'low') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F5A524] bg-[#F5A524]/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F5A524]" />
        Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E5484D] bg-[#E5484D]/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
      Out of Stock
    </span>
  );
};

// Category pill colors mapping
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'GLP-1 & Metabolic':
      return 'bg-blue-50 text-[#1C7FDB] border-blue-200/60';
    case 'Tissue Repair & Recovery':
      return 'bg-teal-50 text-[#12B8A6] border-teal-200/60';
    case 'Growth Hormone Secretagogues':
      return 'bg-indigo-50 text-indigo-600 border-indigo-200/60';
    case 'Longevity & Mitochondrial':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    case 'Cosmetic & Copper Peptides':
      return 'bg-sky-50 text-sky-700 border-sky-200/60';
    default:
      return 'bg-slate-100 text-[#5F7088] border-slate-200';
  }
};

export const ProductTable: React.FC = () => {
  const {
    loading,
    paginatedProducts,
    totalFilteredCount,
    totalPages,
    filters,
    setPage,
    setPageSize,
    selectedIds,
    toggleSelect,
    selectAll,
    deselectAll,
    isAllSelected,
    openEditDrawer,
    openDeleteModal,
    duplicateProduct,
    toggleProductStatus,
    openAddDrawer,
    resetFilters,
  } = useProducts();

  // Active menu dropdown ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Expanded group rows (e.g. grouped by name)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroupExpand = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Group products by base name if groupByProduct is active
  const groupedData = React.useMemo(() => {
    if (!filters.groupByProduct) {
      return { isGrouped: false, groups: [] };
    }

    const groupMap = new Map<string, Product[]>();
    paginatedProducts.forEach((prod) => {
      const existing = groupMap.get(prod.name) || [];
      existing.push(prod);
      groupMap.set(prod.name, existing);
    });

    return {
      isGrouped: true,
      groups: Array.from(groupMap.entries()).map(([name, items]) => ({
        name,
        items,
        hasMultiple: items.length > 1,
      })),
    };
  }, [paginatedProducts, filters.groupByProduct]);

  // Loading Skeletons
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E3EAF2] shadow-card overflow-hidden">
        <div className="divide-y divide-[#E3EAF2]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
              <div className="w-5 h-5 bg-slate-200 rounded" />
              <div className="w-10 h-10 bg-slate-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="w-48 h-4 bg-slate-200 rounded" />
                <div className="w-24 h-3 bg-slate-100 rounded" />
              </div>
              <div className="w-16 h-5 bg-slate-200 rounded" />
              <div className="w-24 h-6 bg-slate-200 rounded-full" />
              <div className="w-16 h-4 bg-slate-200 rounded" />
              <div className="w-10 h-5 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State: No results from search / filter
  if (totalFilteredCount === 0 && (filters.search || filters.category !== 'all' || filters.status !== 'all')) {
    return (
      <div className="bg-white rounded-2xl border border-[#E3EAF2] shadow-card p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-[#5F7088] mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="font-['Sora'] font-semibold text-lg text-[#0A2358]">No matching products found</h3>
        <p className="text-sm text-[#5F7088] mt-1 max-w-sm mx-auto">
          No items match your active filters. Try broadening your search or resetting filters.
        </p>
        <button
          onClick={resetFilters}
          className="mt-5 px-4 py-2 text-xs font-semibold text-[#1C7FDB] bg-[#EAF3FD] hover:bg-[#D5E7FA] rounded-xl transition-colors"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  // Empty State: Brand new empty catalog
  if (totalFilteredCount === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E3EAF2] shadow-card p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EAF3FD] flex items-center justify-center text-[#1C7FDB] mb-4">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="font-['Sora'] font-semibold text-xl text-[#0A2358]">No products in catalog yet</h3>
        <p className="text-sm text-[#5F7088] mt-1.5 max-w-md mx-auto">
          Start building your B2B research peptide catalog by adding your first product formulation or importing a CSV file.
        </p>
        <button
          onClick={openAddDrawer}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-gradient rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add First Product
        </button>
      </div>
    );
  }

  // Row Renderer
  const renderRow = (product: Product, isSubRow: boolean = false) => {
    const isSelected = selectedIds.includes(product.id);
    const isMenuOpen = activeMenuId === product.id;

    return (
      <tr
        key={product.id}
        onClick={() => openEditDrawer(product)}
        className={`group transition-colors cursor-pointer select-none ${
          isSelected
            ? 'bg-[#EAF3FD]/60 hover:bg-[#EAF3FD]'
            : isSubRow
            ? 'bg-[#FAFBFD] hover:bg-[#F1F5F9]'
            : 'hover:bg-[#F8FAFC]'
        }`}
      >
        {/* Checkbox */}
        <td
          className={`py-3.5 px-4 ${isSubRow ? 'pl-8' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelect(product.id)}
            className="w-4 h-4 rounded text-[#1C7FDB] focus:ring-[#1C7FDB] border-slate-300 cursor-pointer"
            aria-label={`Select ${product.name} ${product.spec}`}
          />
        </td>

        {/* Product: Thumbnail + Name + Spec */}
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-[#E3EAF2] overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src={product.image || 'https://via.placeholder.com/40'}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#0A2358] group-hover:text-[#1C7FDB] transition-colors truncate">
                  {product.name}
                </span>
                {product.featured && (
                  <span className="text-[10px] font-semibold text-[#12B8A6] bg-[#12B8A6]/10 px-1.5 py-0.2 rounded">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5F7088] mt-0.5">
                <span className="font-medium text-slate-600">{product.spec}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px]">{product.purity}% pure</span>
              </div>
            </div>
          </div>
        </td>

        {/* SKU */}
        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
          <CopySkuButton sku={product.sku} />
        </td>

        {/* Category */}
        <td className="py-3.5 px-4">
          <span
            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border whitespace-nowrap ${getCategoryColor(
              product.category
            )}`}
          >
            {product.category}
          </span>
        </td>

        {/* Price (mono right-aligned) */}
        <td className="py-3.5 px-4 text-right">
          <div className="font-mono font-bold text-sm text-[#0A2358] tabular-nums">
            ${product.price.toFixed(2)}
          </div>
          {product.comparePrice && (
            <div className="font-mono text-xs text-[#5F7088] line-through tabular-nums">
              ${product.comparePrice.toFixed(2)}
            </div>
          )}
        </td>

        {/* Stock status pill */}
        <td className="py-3.5 px-4">
          <StockStatusBadge status={product.stock} />
        </td>

        {/* Status Toggle Switch (Active / Draft) */}
        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleProductStatus(product.id)}
            role="switch"
            aria-checked={product.status === 'active'}
            aria-label={`Toggle active status for ${product.name}`}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-[#1C7FDB] outline-none ${
              product.status === 'active' ? 'bg-[#12B8A6]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                product.status === 'active' ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="ml-2 text-xs font-medium text-[#5F7088] capitalize">
            {product.status}
          </span>
        </td>

        {/* Updated Date */}
        <td className="py-3.5 px-4 text-xs text-[#5F7088] font-mono whitespace-nowrap">
          {new Date(product.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </td>

        {/* Actions Dropdown */}
        <td className="py-3.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setActiveMenuId(isMenuOpen ? null : product.id)}
            className="p-1.5 text-[#5F7088] hover:text-[#0A2358] hover:bg-slate-200/60 rounded-lg transition-colors"
            aria-label="Row actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-4 top-10 w-36 bg-white rounded-xl shadow-popover border border-[#E3EAF2] py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setActiveMenuId(null);
                  openEditDrawer(product);
                }}
                className="w-full px-3 py-2 text-xs font-medium text-[#0A2358] hover:bg-[#EAF3FD] flex items-center gap-2 transition-colors text-left"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#1C7FDB]" />
                Edit
              </button>

              <button
                onClick={() => {
                  setActiveMenuId(null);
                  duplicateProduct(product);
                }}
                className="w-full px-3 py-2 text-xs font-medium text-[#0A2358] hover:bg-[#EAF3FD] flex items-center gap-2 transition-colors text-left"
              >
                <CopyPlus className="w-3.5 h-3.5 text-[#12B8A6]" />
                Duplicate
              </button>

              <button
                onClick={() => {
                  setActiveMenuId(null);
                  openDeleteModal(product);
                }}
                className="w-full px-3 py-2 text-xs font-medium text-[#E5484D] hover:bg-red-50 flex items-center gap-2 transition-colors text-left border-t border-[#E3EAF2]/60 mt-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF2] shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Sticky Header */}
          <thead className="bg-[#F8FAFC] border-b border-[#E3EAF2] text-[11px] font-semibold tracking-wider uppercase text-[#5F7088] select-none sticky top-0 z-10">
            <tr>
              <th className="py-3.5 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={isAllSelected ? deselectAll : selectAll}
                  className="w-4 h-4 rounded text-[#1C7FDB] focus:ring-[#1C7FDB] border-slate-300 cursor-pointer"
                  aria-label="Select all products on page"
                />
              </th>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">SKU</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-right">Price</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Updated</th>
              <th className="py-3.5 px-4 text-right w-12">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E3EAF2] text-sm">
            {groupedData.isGrouped
              ? groupedData.groups.map((group) => {
                  if (group.hasMultiple) {
                    const isExpanded = !!expandedGroups[group.name];
                    return (
                      <React.Fragment key={`group-${group.name}`}>
                        {/* Parent Group Header Row */}
                        <tr
                          onClick={() => toggleGroupExpand(group.name)}
                          className="bg-[#F5F8FB]/80 hover:bg-[#EAF3FD]/60 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-4 text-center">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#1C7FDB] inline" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#5F7088] inline" />
                            )}
                          </td>
                          <td colSpan={8} className="py-2.5 px-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm text-[#0A2358]">
                                {group.name}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1C7FDB] bg-[#EAF3FD] px-2 py-0.5 rounded-full font-mono">
                                <Layers className="w-3 h-3" />
                                {group.items.length} specs available
                              </span>
                              <span className="text-xs text-[#5F7088]">
                                ({group.items.map((i) => i.spec).join(', ')})
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Child Rows when expanded */}
                        {isExpanded &&
                          group.items.map((prod) => renderRow(prod, true))}
                      </React.Fragment>
                    );
                  }
                  // Single item in group
                  return renderRow(group.items[0], false);
                })
              : paginatedProducts.map((prod) => renderRow(prod, false))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3.5 border-t border-[#E3EAF2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5F7088] bg-[#FAFBFD]">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-[#0A2358]">{paginatedProducts.length}</strong> of{' '}
            <strong className="text-[#0A2358]">{totalFilteredCount}</strong> products
          </span>

          <div className="flex items-center gap-1.5 pl-3 border-l border-[#E3EAF2]">
            <span>Rows:</span>
            <select
              value={filters.pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border border-[#E3EAF2] rounded-lg px-2 py-1 text-xs font-semibold text-[#0A2358] outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(Math.max(1, filters.page - 1))}
            disabled={filters.page <= 1}
            className="p-1.5 rounded-lg border border-[#E3EAF2] bg-white text-[#0A2358] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2 font-mono font-medium text-[#0A2358]">
            Page {filters.page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages, filters.page + 1))}
            disabled={filters.page >= totalPages}
            className="p-1.5 rounded-lg border border-[#E3EAF2] bg-white text-[#0A2358] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
