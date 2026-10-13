import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';

export const DeleteConfirmModal: React.FC = () => {
  const { deletingProduct, closeDeleteModal, confirmDeleteProduct } = useProducts();

  if (!deletingProduct) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDeleteModal}
          className="fixed inset-0 bg-[#0A2358]/50 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-white rounded-2xl border border-[#E3EAF2] shadow-2xl p-6 max-w-md w-full z-10"
          role="alertdialog"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E5484D] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <button
              onClick={closeDeleteModal}
              className="p-1 text-[#5F7088] hover:text-[#0A2358] rounded-lg transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 id="delete-dialog-title" className="font-['Sora'] font-bold text-lg text-[#0A2358]">
            Delete Product?
          </h3>

          <p id="delete-dialog-desc" className="text-sm text-[#5F7088] mt-2 leading-relaxed">
            Delete <strong className="text-[#0A2358] font-semibold">{deletingProduct.name} {deletingProduct.spec}</strong> ({deletingProduct.sku})? This will remove it from the active catalog.
          </p>

          <p className="text-xs text-[#5F7088] mt-2 bg-slate-50 p-2.5 rounded-xl border border-[#E3EAF2]">
            An <strong>Undo</strong> option will remain available for 5 seconds right after deletion.
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={closeDeleteModal}
              className="px-4 py-2 text-xs font-semibold text-[#5F7088] hover:text-[#0A2358] hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={confirmDeleteProduct}
              className="px-4 py-2 text-xs font-bold text-white bg-[#E5484D] hover:bg-red-600 rounded-xl shadow-sm transition-all"
            >
              Delete Product
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
