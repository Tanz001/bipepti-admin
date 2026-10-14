import React from 'react';
import { Plus } from 'lucide-react';
import { StatsRow } from '../components/products/StatsRow';
import { ProductToolbar } from '../components/products/ProductToolbar';
import { ProductTable } from '../components/products/ProductTable';
import { ProductGrid } from '../components/products/ProductGrid';
import { useProducts } from '../context/ProductsContext';

export const ProductsPage: React.FC = () => {
  const { filters, openAddDrawer, totalFilteredCount } = useProducts();

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-['Sora'] font-bold text-2xl sm:text-3xl text-[#0A2358] tracking-tight">
              Products
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF3FD] text-[#1C7FDB]">
              {totalFilteredCount} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5F7088] mt-1 font-medium">
            Add, edit, or remove products from your catalog
          </p>
        </div>

        <button
          onClick={openAddDrawer}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand-gradient hover:opacity-95 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add product</span>
        </button>
      </div>

      {/* 2. Stats Row */}
      <StatsRow />

      {/* 3. Toolbar */}
      <ProductToolbar />

      {/* 4. Data Table or Grid View */}
      {filters.viewMode === 'table' ? <ProductTable /> : <ProductGrid />}
    </div>
  );
};
