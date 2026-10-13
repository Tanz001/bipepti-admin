import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, EyeOff, FolderEdit, Trash2, X } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';

export const BulkActionsBar: React.FC = () => {
  const {
    selectedIds,
    deselectAll,
    bulkSetActive,
    bulkSetDraft,
    bulkChangeCategory,
    bulkDelete,
    allCategories,
  } = useProducts();

  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

  if (selectedIds.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0A2358] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 sm:gap-4 max-w-2xl w-[92vw] sm:w-auto overflow-x-auto"
      >
        {/* Count badge */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/15 shrink-0">
          <span className="w-6 h-6 rounded-full bg-[#12B8A6] text-white flex items-center justify-center text-xs font-mono font-bold">
            {selectedIds.length}
          </span>
          <span className="text-xs font-medium text-white/90 whitespace-nowrap">
            selected
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={bulkSetActive}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#12B8A6]" />
            <span>Set Active</span>
          </button>

          <button
            onClick={bulkSetDraft}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <EyeOff className="w-3.5 h-3.5 text-[#F5A524]" />
            <span>Set Draft</span>
          </button>

          {/* Change Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
            >
              <FolderEdit className="w-3.5 h-3.5 text-[#1C7FDB]" />
              <span>Category</span>
            </button>

            {isCategoryPickerOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-52 bg-white text-[#0A2358] rounded-xl shadow-popover border border-[#E3EAF2] p-1.5 z-50">
                <p className="px-2 py-1 text-[11px] font-semibold text-[#5F7088] uppercase tracking-wider">
                  Select Category
                </p>
                <div className="max-h-48 overflow-y-auto">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        bulkChangeCategory(cat);
                        setIsCategoryPickerOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs font-medium hover:bg-[#EAF3FD] hover:text-[#1C7FDB] rounded-lg transition-colors truncate"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={bulkDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {/* Clear selection */}
        <button
          onClick={deselectAll}
          className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 ml-auto transition-colors shrink-0"
          title="Deselect all"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
