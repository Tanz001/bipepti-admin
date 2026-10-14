import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ShieldCheck, ShoppingBag, Filter, Sparkles, Check } from 'lucide-react';
import { BiopeptiLogo } from '../common/BiopeptiLogo';
import { useProducts } from '../../context/ProductsContext';
import { formatPriceRange, getStrengthsLabel } from '../../types/product';

interface StorefrontPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StorefrontPreviewModal: React.FC<StorefrontPreviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { products } = useProducts();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [addedItem, setAddedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  // Storefront only shows active products
  const activeProducts = products.filter((p) => p.status === 'active');
  const categories = ['All', ...Array.from(new Set(activeProducts.map((p) => p.category)))];

  const displayed = activeProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      getStrengthsLabel(p).toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleQuickOrder = (sku: string) => {
    setAddedItem(sku);
    setTimeout(() => setAddedItem(null), 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0A2358]/60 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />

        {/* Modal Browser Frame */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-[#F5F8FB] rounded-2xl border border-[#E3EAF2] shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden z-10"
        >
          {/* Simulated Browser Bar */}
          <div className="bg-[#0A2358] text-white px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-teal-400 inline-block" />
              <span className="text-xs font-mono text-white/70 ml-2">
                https://biopepti.com/catalog (Live Buyer View)
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-white/70 hover:text-white rounded-lg transition-colors"
              aria-label="Close storefront preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Storefront Header */}
          <header className="bg-white border-b border-[#E3EAF2] px-6 py-4 flex items-center justify-between shrink-0">
            <BiopeptiLogo size="md" />

            <div className="flex items-center gap-4 text-xs font-medium text-[#5F7088]">
              <span className="flex items-center gap-1.5 text-[#12B8A6] font-semibold">
                <ShieldCheck className="w-4 h-4" /> HPLC ≥ 99.0% Guaranteed
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">B2B Batch Pricing</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF3FD] text-[#1C7FDB] font-semibold">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Inquiry Cart (0)</span>
              </button>
            </div>
          </header>

          {/* Storefront Catalog Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Hero Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0A2358] via-[#071A42] to-[#12B8A6]/80 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-[#12B8A6] mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Certified Lyophilized Peptides
                </div>
                <h2 className="font-['Sora'] font-bold text-2xl">B2B Wholesale Catalog</h2>
                <p className="text-xs text-white/80 mt-1 max-w-xl">
                  Analytical reference peptides for laboratory research. Full HPLC & Mass Spectrometry COA reports included with each batch.
                </p>
              </div>

              <div className="shrink-0 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 text-center">
                <p className="text-xs text-white/70">Published Formulations</p>
                <p className="font-mono text-2xl font-bold text-[#12B8A6]">{activeProducts.length}</p>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E3EAF2]">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#5F7088] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search buyer catalog..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-[#F5F8FB] border border-[#E3EAF2] rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <Filter className="w-3.5 h-3.5 text-[#5F7088] shrink-0" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCat === cat
                        ? 'bg-[#1C7FDB] text-white'
                        : 'text-[#5F7088] hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayed.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-[#E3EAF2] p-4 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-4/3 rounded-xl bg-slate-50 border border-[#E3EAF2] overflow-hidden mb-3 relative flex items-center justify-center">
                      <img
                        src={product.image || 'https://via.placeholder.com/120'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-['Sora'] font-bold text-sm text-[#0A2358]">
                          {product.name}
                        </h4>
                        <p className="text-xs text-[#5F7088] font-medium">
                          {getStrengthsLabel(product)}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-[#5F7088] bg-slate-100 px-1.5 py-0.5 rounded">
                        {product.sku}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5F7088] line-clamp-2 mt-2 leading-relaxed">
                      {product.description || 'Analytical laboratory reagent.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E3EAF2] flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-base text-[#0A2358]">
                        {formatPriceRange(product)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleQuickOrder(product.sku)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                        addedItem === product.sku
                          ? 'bg-[#12B8A6] text-white'
                          : 'bg-[#0A2358] text-white hover:bg-[#071A42]'
                      }`}
                    >
                      {addedItem === product.sku ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" /> Inquired
                        </span>
                      ) : (
                        'Request Quote'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
