import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  AlertCircle,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { createVariantId, getProductVariants, StockStatus } from '../../types/product';
import { VIAL_PLACEHOLDER_SVG } from '../../data/seedProducts';
import { useProducts } from '../../context/ProductsContext';

const variantSchema = z.object({
  id: z.string(),
  strength: z.string().min(1, 'Strength required (e.g. 5mg/vial*10 vials)'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  stock: z.enum(['in_stock', 'low', 'out_of_stock']),
  sku: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z
    .string()
    .min(2, 'SKU must be at least 2 characters')
    .regex(/^[A-Za-z0-9\-_]+$/, 'SKU may only contain letters, numbers, hyphens, underscores'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().optional(),
  buyLink: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.trim() === '' || /^https?:\/\//i.test(v.trim()),
      'Buy Now link must start with http:// or https://'
    ),
  status: z.enum(['active', 'draft']),
  variants: z.array(variantSchema).min(1, 'Add at least one strength / price'),
});

type ProductFormData = z.infer<typeof productSchema>;

const emptyVariant = () => ({
  id: createVariantId(),
  strength: '5mg/vial*10 vials',
  price: 99,
  stock: 'in_stock' as const,
  sku: '',
});

export const ProductDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    editingProduct,
    closeDrawer,
    createProduct,
    updateProduct,
    allCategories,
    products,
  } = useProducts();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(VIAL_PLACEHOLDER_SVG);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      sku: '',
      category: 'GLP-1 & Metabolic',
      description: '',
      buyLink: '',
      status: 'active',
      variants: [
        emptyVariant(),
        { ...emptyVariant(), strength: '10mg/vial*10 vials', price: 149 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const watchedName = watch('name') || 'Product name';
  const watchedSku = watch('sku');
  const watchedVariants = watch('variants') || [];
  const watchedStatus = watch('status');

  useEffect(() => {
    if (editingProduct) {
      const variants = getProductVariants(editingProduct).map((v) => ({
        id: v.id,
        strength: v.strength,
        price: v.price,
        stock: v.stock,
        sku: v.sku || '',
      }));
      reset({
        name: editingProduct.name,
        sku: editingProduct.sku,
        category: editingProduct.category,
        description: editingProduct.description || '',
        buyLink: editingProduct.buyLink || '',
        status: editingProduct.status,
        variants: variants.length > 0 ? variants : [emptyVariant()],
      });
      setImagePreview(editingProduct.image || VIAL_PLACEHOLDER_SVG);
      setImageFile(null);
    } else {
      reset({
        name: '',
        sku: '',
        category: allCategories[0] || 'GLP-1 & Metabolic',
        description: '',
        buyLink: '',
        status: 'active',
        variants: [
          emptyVariant(),
          { ...emptyVariant(), strength: '10mg/vial*10 vials', price: 149 },
        ],
      });
      setImagePreview(VIAL_PLACEHOLDER_SVG);
      setImageFile(null);
    }
    setShowUnsavedWarning(false);
  }, [editingProduct, reset, allCategories, isDrawerOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        handleAttemptClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, isDirty]);

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      closeDrawer();
    }
  };

  const generateSku = () => {
    const currentName = watch('name')?.trim();
    let prefix = 'BIO';
    if (currentName) {
      prefix = currentName
        .replace(/[^A-Za-z0-9]/g, '')
        .substring(0, 6)
        .toUpperCase();
    }

    let candidate = prefix;
    let counter = 1;
    while (
      products.some(
        (p) =>
          p.sku.toUpperCase() === candidate.toUpperCase() &&
          (!editingProduct || p.id !== editingProduct.id)
      )
    ) {
      candidate = `${prefix}${counter}`;
      counter++;
    }

    setValue('sku', candidate, { shouldValidate: true, shouldDirty: true });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ProductFormData, overrideStatus?: 'active' | 'draft') => {
    setIsSubmitting(true);
    try {
      const variants = data.variants.map((v) => ({
        id: v.id || createVariantId(),
        strength: v.strength.trim(),
        price: Number(v.price),
        stock: v.stock as StockStatus,
        sku: v.sku?.trim() || undefined,
      }));

      const payload = {
        name: data.name.trim(),
        sku: data.sku.trim().toUpperCase(),
        category: data.category.trim(),
        description: data.description?.trim() || undefined,
        buyLink: data.buyLink?.trim() || '',
        status: overrideStatus || data.status,
        featured: editingProduct?.featured ?? false,
        variants,
        purity: editingProduct?.purity ?? 99.5,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload, imageFile);
      } else {
        await createProduct(payload, imageFile);
      }

      closeDrawer();
    } catch {
      // Toast handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricePreview =
    watchedVariants.length === 0
      ? '—'
      : (() => {
          const prices = watchedVariants
            .map((v) => Number(v.price) || 0)
            .filter((p) => p > 0);
          if (prices.length === 0) return '—';
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return min === max
            ? `$${min.toFixed(2)}`
            : `$${min.toFixed(2)} – $${max.toFixed(2)}`;
        })();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleAttemptClose}
            className="fixed inset-0 bg-[#0A2358]/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:w-[520px] bg-white h-full shadow-2xl flex flex-col z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <div className="h-16 px-6 border-b border-[#E3EAF2] flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <h3
                  id="drawer-title"
                  className="font-['Sora'] font-bold text-lg text-[#0A2358] truncate"
                >
                  {editingProduct ? 'Edit product' : 'Add product'}
                </h3>
                <p className="text-xs text-[#5F7088]">
                  One product · multiple strengths & prices
                </p>
              </div>
              <button
                onClick={handleAttemptClose}
                className="p-2 text-[#5F7088] hover:text-[#0A2358] hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {showUnsavedWarning && (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Discard unsaved changes?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUnsavedWarning(false)}
                    className="font-medium hover:underline"
                  >
                    Keep editing
                  </button>
                  <button
                    onClick={closeDrawer}
                    className="font-bold text-red-600 bg-white px-2 py-1 rounded shadow-xs"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            <form
              id="product-form"
              onSubmit={handleSubmit((data) => onSubmit(data as ProductFormData))}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-7"
            >
              {/* Basics */}
              <section className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                    Product name <span className="text-[#E5484D]">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="e.g. Tirzepatide"
                    className="w-full h-10 px-3.5 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none transition-all"
                  />
                  {errors.name && (
                    <p className="text-xs text-[#E5484D] mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#0A2358]">
                      Base SKU <span className="text-[#E5484D]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateSku}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1C7FDB] hover:text-[#0A2358]"
                    >
                      <Sparkles className="w-3 h-3 text-[#12B8A6]" />
                      Auto-generate
                    </button>
                  </div>
                  <input
                    type="text"
                    {...register('sku')}
                    placeholder="e.g. TRZ"
                    className="w-full h-10 px-3.5 font-mono text-sm uppercase bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none"
                  />
                  {errors.sku && (
                    <p className="text-xs text-[#E5484D] mt-1">{errors.sku.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                    Category <span className="text-[#E5484D]">*</span>
                  </label>
                  {!isAddingNewCategory ? (
                    <div className="flex gap-2">
                      <select
                        {...register('category')}
                        className="flex-1 h-10 px-3 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] outline-none"
                      >
                        {allCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCategory(true)}
                        className="px-3 h-10 text-xs font-semibold text-[#1C7FDB] bg-[#EAF3FD] hover:bg-[#D5E7FA] rounded-xl"
                      >
                        + New
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        placeholder="New category"
                        className="flex-1 h-10 px-3 text-sm border border-[#1C7FDB] rounded-xl outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategoryInput.trim()) {
                            setValue('category', newCategoryInput.trim(), { shouldDirty: true });
                            setIsAddingNewCategory(false);
                            setNewCategoryInput('');
                          }
                        }}
                        className="px-3 h-10 text-xs font-semibold text-white bg-[#12B8A6] rounded-xl"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCategory(false)}
                        className="px-2.5 h-10 text-xs text-[#5F7088] bg-slate-100 rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    {...register('description')}
                    placeholder="Optional short description"
                    className="w-full p-3 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                    Buy Now link
                  </label>
                  <input
                    type="url"
                    {...register('buyLink')}
                    placeholder="https://…"
                    className="w-full h-10 px-3.5 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none transition-all"
                  />
                  <p className="text-[11px] text-[#5F7088] mt-1">
                    Opens on the landing page when a visitor clicks Buy Now.
                  </p>
                  {errors.buyLink && (
                    <p className="text-xs text-[#E5484D] mt-1">{errors.buyLink.message}</p>
                  )}
                </div>
              </section>

              {/* Variants */}
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E3EAF2] pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1C7FDB]" />
                    <h4 className="font-['Sora'] font-semibold text-sm text-[#0A2358]">
                      Strengths & prices
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        ...emptyVariant(),
                        strength: '',
                        price: 0,
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C7FDB] hover:text-[#0A2358]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add strength
                  </button>
                </div>

                <p className="text-[11px] text-[#5F7088]">
                  Add each quantity (5mg, 10mg, 20mg…) with its own price in one product.
                </p>

                {errors.variants?.root && (
                  <p className="text-xs text-[#E5484D]">{errors.variants.root.message}</p>
                )}
                {typeof errors.variants?.message === 'string' && (
                  <p className="text-xs text-[#E5484D]">{errors.variants.message}</p>
                )}

                <div className="space-y-2.5">
                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_1fr_1fr_36px] gap-2 px-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5F7088]">
                      Size / pack
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5F7088]">
                      Price (USD)
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5F7088]">
                      Stock
                    </span>
                    <span />
                  </div>

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_1fr_1fr_36px] gap-2 items-start"
                    >
                      <div>
                        <input
                          type="text"
                          {...register(`variants.${index}.strength`)}
                          placeholder="5mg/vial*10 vials"
                          className="w-full h-10 px-3 text-sm border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] outline-none"
                        />
                        {errors.variants?.[index]?.strength && (
                          <p className="text-[10px] text-[#E5484D] mt-0.5">
                            {errors.variants[index]?.strength?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#5F7088] font-mono">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            {...register(`variants.${index}.price`)}
                            placeholder="99"
                            className="w-full h-10 pl-7 pr-2 font-mono text-sm border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] outline-none"
                          />
                        </div>
                        {errors.variants?.[index]?.price && (
                          <p className="text-[10px] text-[#E5484D] mt-0.5">
                            {errors.variants[index]?.price?.message}
                          </p>
                        )}
                      </div>
                      <select
                        {...register(`variants.${index}.stock`)}
                        className="w-full h-10 px-2 text-xs border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] outline-none bg-white"
                      >
                        <option value="in_stock">In stock</option>
                        <option value="low">Low</option>
                        <option value="out_of_stock">Out</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (fields.length > 1) remove(index);
                        }}
                        disabled={fields.length <= 1}
                        className="h-10 w-9 flex items-center justify-center text-[#E5484D] hover:bg-red-50 rounded-xl disabled:opacity-30 disabled:pointer-events-none"
                        title="Remove strength"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <input type="hidden" {...register(`variants.${index}.id`)} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Image + status */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E3EAF2] pb-2">
                  <ImageIcon className="w-4 h-4 text-[#1C7FDB]" />
                  <h4 className="font-['Sora'] font-semibold text-sm text-[#0A2358]">
                    Image & visibility
                  </h4>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-[#E3EAF2] overflow-hidden bg-slate-50 shrink-0">
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 h-10 px-3.5 text-xs font-semibold text-[#0A2358] border border-[#E3EAF2] rounded-xl hover:bg-[#F5F8FB]"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#1C7FDB]" />
                    Upload image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E3EAF2] bg-[#F8FAFC]">
                  <div>
                    <p className="text-xs font-semibold text-[#0A2358]">Status</p>
                    <p className="text-[11px] text-[#5F7088]">Active products show in catalog</p>
                  </div>
                  <select
                    {...register('status')}
                    className="h-9 px-3 text-xs font-semibold rounded-lg border border-[#E3EAF2] bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </section>

              {/* Compact preview */}
              <div className="rounded-2xl border border-[#E3EAF2] bg-[#F5F8FB] p-4">
                <p className="text-[11px] font-medium text-[#5F7088] mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-[#E3EAF2] shrink-0">
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#0A2358] truncate">{watchedName}</p>
                    <p className="text-xs text-[#5F7088] truncate">
                      {watchedVariants
                        .map((v) => v.strength)
                        .filter(Boolean)
                        .join(' · ') || 'No strengths yet'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-sm text-[#0A2358]">{pricePreview}</p>
                    <p className="text-[10px] font-mono text-[#5F7088]">
                      {watchedSku || 'SKU'} · {watchedStatus}
                    </p>
                  </div>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-[#E3EAF2] bg-white flex items-center justify-between shrink-0 gap-3">
              <button
                type="button"
                onClick={handleAttemptClose}
                className="px-4 py-2.5 text-xs font-semibold text-[#5F7088] hover:text-[#0A2358] hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit((data) => onSubmit(data as ProductFormData, 'draft'))}
                  className="px-4 py-2.5 text-xs font-semibold text-[#0A2358] bg-white border border-[#E3EAF2] hover:bg-[#F5F8FB] rounded-xl"
                >
                  Save draft
                </button>
                <button
                  type="submit"
                  form="product-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-brand-gradient rounded-xl shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>{editingProduct ? 'Save changes' : 'Publish'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
