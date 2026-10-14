import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Command, Plus } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { getNavLabel } from '../../config/navigation';

interface AdminTopBarProps {
  onOpenMobileSidebar: () => void;
  onOpenStorePreview: () => void;
  isSidebarCollapsed: boolean;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  onOpenMobileSidebar,
}) => {
  const { filters, setSearch, openAddDrawer } = useProducts();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pageLabel = getNavLabel(location.pathname);
  const isProductsPage = location.pathname.startsWith('/admin/products');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key.toLowerCase() === 'n' && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openAddDrawer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openAddDrawer]);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-sm border-b border-[#E3EAF2] flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 -ml-1 text-[#5F7088] hover:text-[#0A2358] hover:bg-[#F1F5F9] rounded-lg transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium min-w-0">
          <span className="text-[#5F7088] hidden sm:inline">Admin</span>
          <span className="text-[#CBD5E1] hidden sm:inline">/</span>
          <span className="font-semibold text-[#0A2358] truncate">{pageLabel}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {isProductsPage && (
          <div className="relative w-40 sm:w-56 md:w-72">
            <Search className="w-4 h-4 text-[#5F7088] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search products…"
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-12 text-xs sm:text-sm bg-[#F5F8FB] border border-[#E3EAF2] rounded-xl text-[#0A2358] placeholder-[#5F7088] transition-all focus:bg-white focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none"
            />
            <div className="hidden sm:flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#5F7088] bg-white border border-[#E3EAF2] rounded px-1.5 py-0.5 pointer-events-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>
        )}

        <button
          onClick={openAddDrawer}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs sm:text-sm font-semibold text-white bg-brand-gradient rounded-xl shadow-sm hover:shadow-md transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#1C7FDB]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add product</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};
