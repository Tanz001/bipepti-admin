import React from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutList,
  LayoutGrid,
  Download,
  Upload,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { ProductFilterState } from '../../types/product';

export const ProductToolbar: React.FC = () => {
  const {
    filters,
    setSearch,
    setCategory,
    setStatus,
    setSortBy,
    setViewMode,
    setGroupByProduct,
    allCategories,
    openImportModal,
    filteredProducts,
    resetCatalogToSeed,
  } = useProducts();

  // Export current filtered products to CSV
  const handleExportCsv = () => {
    if (filteredProducts.length === 0) return;

    const headers = [
      'SKU',
      'Name',
      'Strengths',
      'Category',
      'Price Range (USD)',
      'Status',
    ];

    const rows = filteredProducts.map((p) => {
      const strengths = (p.variants || [])
        .map((v) => `${v.strength}:$${v.price}`)
        .join(' | ');
      const prices = (p.variants || []).map((v) => v.price);
      const min = prices.length ? Math.min(...prices) : p.price || 0;
      const max = prices.length ? Math.max(...prices) : p.price || 0;
      const range = min === max ? String(min) : `${min}-${max}`;
      return [
        `"${p.sku}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${strengths.replace(/"/g, '""')}"`,
        `"${p.category.replace(/"/g, '""')}"`,
        `"${range}"`,
        p.status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `biopepti-products-export-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF2] p-4 shadow-card mb-4 flex flex-col gap-3.5">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5F7088] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, SKU, spec, CAS..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-white border border-[#E3EAF2] rounded-xl text-[#0A2358] placeholder-[#5F7088] focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none transition-all shadow-xs"
          />
        </div>

        {/* Right Action buttons: Import, Export, Reset */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={openImportModal}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-[#0A2358] bg-white border border-[#E3EAF2] hover:bg-[#F5F8FB] rounded-xl transition-colors shadow-xs shrink-0"
            title="Import products from CSV file"
          >
            <Upload className="w-3.5 h-3.5 text-[#1C7FDB]" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-[#0A2358] bg-white border border-[#E3EAF2] hover:bg-[#F5F8FB] rounded-xl transition-colors shadow-xs shrink-0"
            title="Export filtered products"
          >
            <Download className="w-3.5 h-3.5 text-[#12B8A6]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={resetCatalogToSeed}
            className="inline-flex items-center gap-1.5 h-9 px-2.5 text-xs font-medium text-[#5F7088] hover:text-[#0A2358] hover:bg-[#F1F5F9] rounded-xl transition-colors shrink-0"
            title="Reset catalog back to sample data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Reset Seeds</span>
          </button>
        </div>
      </div>

      {/* Second filter strip: Filters, Sorting, Grouping, View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E3EAF2]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F5F8FB] border border-[#E3EAF2] rounded-xl px-2.5 h-9">
            <Filter className="w-3.5 h-3.5 text-[#5F7088]" />
            <select
              value={filters.category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#0A2358] outline-none cursor-pointer pr-1"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Segmented / Dropdown */}
          <div className="flex items-center bg-[#F5F8FB] p-0.5 rounded-xl border border-[#E3EAF2] text-xs">
            {(
              [
                { label: 'All', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Draft', value: 'draft' },
                { label: 'Out of stock', value: 'out_of_stock' },
              ] as const
            ).map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  filters.status === s.value
                    ? 'bg-white text-[#0A2358] font-bold shadow-xs'
                    : 'text-[#5F7088] hover:text-[#0A2358]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F5F8FB] border border-[#E3EAF2] rounded-xl px-2.5 h-9">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#5F7088]" />
            <select
              value={filters.sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductFilterState['sortBy'])}
              className="bg-transparent text-xs font-medium text-[#0A2358] outline-none cursor-pointer pr-1"
            >
              <option value="newest">Sort: Newest</option>
              <option value="name-asc">Sort: Name A-Z</option>
              <option value="price-asc">Sort: Price Low → High</option>
              <option value="price-desc">Sort: Price High → Low</option>
            </select>
          </div>
        </div>

        {/* Right side: Group rows toggle + View Mode (Table/Grid) */}
        <div className="flex items-center gap-2">
          {/* Group Expandable Rows Toggle */}
          <button
            onClick={() => setGroupByProduct(!filters.groupByProduct)}
            className={`inline-flex items-center gap-1.5 h-9 px-2.5 text-xs font-medium rounded-xl border transition-all ${
              filters.groupByProduct
                ? 'bg-[#EAF3FD] text-[#1C7FDB] border-[#1C7FDB]/30 font-semibold'
                : 'bg-white text-[#5F7088] border-[#E3EAF2] hover:text-[#0A2358]'
            }`}
            title="Group variants with the same base name (e.g. Adipotide, AOD9604)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Group Variants</span>
          </button>

          {/* Table vs Grid toggle */}
          <div className="flex items-center bg-[#F5F8FB] p-0.5 rounded-xl border border-[#E3EAF2]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                filters.viewMode === 'table'
                  ? 'bg-white text-[#0A2358] shadow-xs'
                  : 'text-[#5F7088] hover:text-[#0A2358]'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                filters.viewMode === 'grid'
                  ? 'bg-white text-[#0A2358] shadow-xs'
                  : 'text-[#5F7088] hover:text-[#0A2358]'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
