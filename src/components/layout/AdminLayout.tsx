import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { ProductDrawer } from '../products/ProductDrawer';
import { DeleteConfirmModal } from '../products/DeleteConfirmModal';
import { BulkActionsBar } from '../products/BulkActionsBar';
import { CsvImportModal } from '../products/CsvImportModal';
import { StorefrontPreviewModal } from '../products/StorefrontPreviewModal';

const SIDEBAR_COLLAPSED_KEY = 'biopepti_sidebar_collapsed';

export const AdminLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isStorePreviewOpen, setIsStorePreviewOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
    } catch (e) {
      console.error(e);
    }
  }, [isSidebarCollapsed]);

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F5F8FB] text-[#0A2358] flex flex-col antialiased">
      {/* Sidebar (Desktop fixed + Mobile drawer) */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onOpenStorePreview={() => setIsStorePreviewOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isSidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'
        }`}
      >
        <AdminTopBar
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onOpenStorePreview={() => setIsStorePreviewOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals and Drawers */}
      <ProductDrawer />
      <DeleteConfirmModal />
      <BulkActionsBar />
      <CsvImportModal />
      <StorefrontPreviewModal
        isOpen={isStorePreviewOpen}
        onClose={() => setIsStorePreviewOpen(false)}
      />
    </div>
  );
};
