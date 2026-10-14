import React from 'react';
import { Edit2, CopyPlus, Trash2, Check, Copy } from 'lucide-react';
import { formatPriceRange, getProductVariants, getStrengthsLabel } from '../../types/product';
import { useProducts } from '../../context/ProductsContext';
import { useToast } from '../../context/ToastContext';

export const ProductGrid: React.FC = () => {
  const {
    paginatedProducts,
    openEditDrawer,
    openDeleteModal,
    duplicateProduct,
    toggleProductStatus,
  } = useProducts();
  const { showSuccess } = useToast();
  const [copiedSku, setCopiedSku] = React.useState<string | null>(null);

  const handleCopySku = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    showSuccess(`Copied SKU: ${sku}`);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {paginatedProducts.map((product) => (
        <div
          key={product.id}
          onClick={() => openEditDrawer(product)}
          className="bg-white rounded-2xl border border-[#E3EAF2] p-4 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between group"
        >
          {/* Top section: Thumbnail + Status pill */}
          <div>
            <div className="relative aspect-4/3 rounded-xl bg-slate-100 border border-[#E3EAF2] overflow-hidden mb-3.5 flex items-center justify-center">
              <img
                src={product.image || 'https://via.placeholder.com/120'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />

              {/* Status badge in top right */}
              <div className="absolute top-2.5 right-2.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    product.status === 'active'
                      ? 'bg-[#12B8A6] text-white shadow-xs'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {product.status}
                </span>
              </div>

              {getProductVariants(product).length > 1 && (
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-bold bg-[#0A2358]/80 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {getProductVariants(product).length} strengths
                  </span>
                </div>
              )}
            </div>

            {/* Title & Category */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h4 className="font-['Sora'] font-bold text-base text-[#0A2358] group-hover:text-[#1C7FDB] transition-colors line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-xs font-medium text-[#5F7088]">{getStrengthsLabel(product)}</p>
              </div>

              {/* SKU pill */}
              <button
                onClick={(e) => handleCopySku(product.sku, e)}
                className="font-mono text-xs text-[#0A2358] bg-slate-100 hover:bg-[#EAF3FD] px-2 py-0.5 rounded flex items-center gap-1 transition-colors shrink-0"
                title="Copy SKU"
              >
                <span>{product.sku}</span>
                {copiedSku === product.sku ? (
                  <Check className="w-3 h-3 text-[#12B8A6]" />
                ) : (
                  <Copy className="w-3 h-3 text-[#5F7088]" />
                )}
              </button>
            </div>

            <p className="text-[11px] text-[#5F7088] line-clamp-2 mt-2 leading-relaxed">
              {product.description || 'Certified peptide research reagent.'}
            </p>
          </div>

          {/* Bottom section: Price + Actions */}
          <div className="mt-4 pt-3 border-t border-[#E3EAF2] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#5F7088] uppercase tracking-wider block font-medium">
                Price
              </span>
              <span className="font-mono font-bold text-lg text-[#0A2358] tabular-nums">
                {formatPriceRange(product)}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => openEditDrawer(product)}
                className="p-1.5 text-[#5F7088] hover:text-[#1C7FDB] hover:bg-[#EAF3FD] rounded-lg transition-colors"
                title="Edit product"
                aria-label="Edit product"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => duplicateProduct(product)}
                className="p-1.5 text-[#5F7088] hover:text-[#12B8A6] hover:bg-[#12B8A6]/10 rounded-lg transition-colors"
                title="Duplicate product"
                aria-label="Duplicate product"
              >
                <CopyPlus className="w-4 h-4" />
              </button>

              <button
                onClick={() => openDeleteModal(product)}
                className="p-1.5 text-[#5F7088] hover:text-[#E5484D] hover:bg-red-50 rounded-lg transition-colors"
                title="Delete product"
                aria-label="Delete product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
