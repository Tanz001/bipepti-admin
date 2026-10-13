import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Command,
  Plus,
  ExternalLink,
  AlertTriangle,
  FileCheck,
  Check,
} from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';

interface AdminTopBarProps {
  onOpenMobileSidebar: () => void;
  onOpenStorePreview: () => void;
  isSidebarCollapsed: boolean;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  onOpenMobileSidebar,
  onOpenStorePreview,
  isSidebarCollapsed,
}) => {
  const { filters, setSearch, openAddDrawer, stats } = useProducts();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K and /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
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

  // Click outside to close notification popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 h-16 bg-white border-b border-[#E3EAF2] flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isSidebarCollapsed ? 'lg:pl-6' : 'lg:pl-6'
      }`}
    >
      {/* Left: Mobile hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 -ml-1 text-[#5F7088] hover:text-[#0A2358] hover:bg-[#F1F5F9] rounded-lg transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <span className="text-[#5F7088] hover:text-[#0A2358] transition-colors">Dashboard</span>
          <span className="text-[#CBD5E1]">/</span>
          <span className="font-semibold text-[#0A2358]">Products</span>
        </nav>
      </div>

      {/* Center/Right: Global search bar + Notifications + Quick Action */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Search input with keyboard hint */}
        <div className="relative w-44 sm:w-64 md:w-80">
          <Search className="w-4 h-4 text-[#5F7088] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search catalog, SKU, spec... (/)"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-12 text-xs sm:text-sm bg-[#F5F8FB] border border-[#E3EAF2] rounded-xl text-[#0A2358] placeholder-[#5F7088] transition-all focus:bg-white focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none"
          />
          <div className="hidden sm:flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#5F7088] bg-white border border-[#E3EAF2] rounded px-1.5 py-0.5 pointer-events-none shadow-xs">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* View Website Button */}
        <button
          onClick={onOpenStorePreview}
          className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-[#0A2358] bg-white border border-[#E3EAF2] hover:bg-[#F5F8FB] rounded-xl transition-colors shadow-xs"
          title="Preview public catalog view"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#1C7FDB]" />
          <span>Live Store</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (unreadNotifications > 0) setUnreadNotifications(0);
            }}
            className="relative p-2 text-[#5F7088] hover:text-[#0A2358] hover:bg-[#F1F5F9] rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#1C7FDB]"
            aria-label="View system notifications"
            title="Catalog notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1C7FDB] ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-[#E3EAF2] shadow-popover p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#E3EAF2]">
                <span className="text-xs font-bold text-[#0A2358]">Catalog Alerts</span>
                <span className="text-[11px] font-medium text-[#12B8A6] flex items-center gap-1">
                  <Check className="w-3 h-3" /> System Synchronized
                </span>
              </div>

              <div className="divide-y divide-[#E3EAF2]/60 max-h-72 overflow-y-auto mt-1">
                {stats.outOfStock > 0 && (
                  <div className="py-2.5 flex items-start gap-2.5 text-xs">
                    <div className="p-1 rounded bg-amber-50 text-amber-600 shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0A2358]">Low/Out of Stock Alert</p>
                      <p className="text-[#5F7088] mt-0.5">
                        {stats.outOfStock} items currently marked as out of stock. Consider restocking batches.
                      </p>
                    </div>
                  </div>
                )}

                <div className="py-2.5 flex items-start gap-2.5 text-xs">
                  <div className="p-1 rounded bg-teal-50 text-[#12B8A6] shrink-0 mt-0.5">
                    <FileCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A2358]">COA Verification Complete</p>
                    <p className="text-[#5F7088] mt-0.5">
                      Lot analysis for Retatrutide 10mg verified at 99.8% purity by LC-MS.
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-2.5 text-xs">
                  <div className="p-1 rounded bg-blue-50 text-[#1C7FDB] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A2358]">Local Cache Synced</p>
                    <p className="text-[#5F7088] mt-0.5">
                      All 30 research peptide entries are live in client database.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary "+ Add product" button */}
        <button
          onClick={openAddDrawer}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs sm:text-sm font-semibold text-white bg-brand-gradient rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#1C7FDB] active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add product</span>
          <span className="sm:hidden">Add</span>
          <kbd className="hidden md:inline-block ml-1 text-[10px] font-mono text-white/80 bg-white/20 px-1 rounded">
            N
          </kbd>
        </button>
      </div>
    </header>
  );
};
