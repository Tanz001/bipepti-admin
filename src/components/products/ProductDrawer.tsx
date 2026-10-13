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
  FileText,
  Image as ImageIcon,
  DollarSign,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Product, StockStatus } from '../../types/product';
import { VIAL_PLACEHOLDER_SVG } from '../../data/seedProducts';
import { useProducts } from '../../context/ProductsContext';

// Zod Schema for Product validation
const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z
    .string()
    .min(2, 'SKU must be at least 2 characters')
    .regex(/^[A-Za-z0-9\-_]+$/, 'SKU may only contain letters, numbers, hyphens, underscores'),
  spec: z.string().min(2, 'Specification is required (e.g. 5mg*10vials)'),
  category: z.string().min(2, 'Category is required'),
  price: z.number().positive('Price must be greater than $0'),
  comparePrice: z.number().optional(),
  stock: z.enum(['in_stock', 'low', 'out_of_stock']),
  purity: z
    .number()
    .min(80, 'Purity must be at least 80%')
    .max(100, 'Purity cannot exceed 100%'),
  testMethod: z.string().optional(),
  casNumber: z.string().optional(),
  description: z.string().optional(),
  tagsText: z.string().optional(),
  minOrderQuantity: z.number().min(1).default(1),
  status: z.enum(['active', 'draft']),
  featured: z.boolean().default(false),
  coaUrl: z.string().optional(),
  volumePricing: z
    .array(
      z.object({
        minQty: z.number().min(2, 'Min Qty must be at least 2'),
        discountPercent: z.number().min(1).max(90, 'Discount must be 1-90%'),
      })
    )
    .optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

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

  // Image uploads state
  const [images, setImages] = useState<string[]>([]);
  const [activeCoverIndex, setActiveCoverIndex] = useState<number>(0);
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
      spec: '5mg*10vials',
      category: 'GLP-1 & Metabolic',
      price: 99,
      stock: 'in_stock',
      purity: 99.5,
      testMethod: 'HPLC / MS',
      casNumber: '',
      description: '',
      tagsText: '',
      minOrderQuantity: 1,
      status: 'active',
      featured: false,
      coaUrl: '',
      volumePricing: [],
    },
  });

  const { fields: volumeFields, append: appendVolumeTier, remove: removeVolumeTier } =
    useFieldArray({
      control,
      name: 'volumePricing',
    });

  // Watched fields for Live Preview Card
  const watchedName = watch('name') || 'Product Name';
  const watchedSpec = watch('spec') || '5mg*10vials';
  const watchedPrice = watch('price') || 99;
  const watchedComparePrice = watch('comparePrice');
  const watchedCategory = watch('category');
  const watchedPurity = watch('purity') || 99.5;
  const watchedStock = watch('stock') || 'in_stock';
  const watchedStatus = watch('status');
  const watchedFeatured = watch('featured');
  const watchedSku = watch('sku');

  // Populate form on edit / add
  useEffect(() => {
    if (editingProduct) {
      reset({
        name: editingProduct.name,
        sku: editingProduct.sku,
        spec: editingProduct.spec,
        category: editingProduct.category,
        price: editingProduct.price,
        comparePrice: editingProduct.comparePrice || undefined,
        stock: editingProduct.stock,
        purity: editingProduct.purity,
        testMethod: editingProduct.testMethod || 'HPLC / MS',
        casNumber: editingProduct.casNumber || '',
        description: editingProduct.description || '',
        tagsText: editingProduct.tags ? editingProduct.tags.join(', ') : '',
        minOrderQuantity: editingProduct.minOrderQuantity || 1,
        status: editingProduct.status,
        featured: editingProduct.featured,
        coaUrl: editingProduct.coaUrl || '',
        volumePricing: editingProduct.volumePricing || [],
      });
      setImages(editingProduct.image ? [editingProduct.image] : [VIAL_PLACEHOLDER_SVG]);
      setActiveCoverIndex(0);
    } else {
      // New product defaults
      reset({
        name: '',
        sku: '',
        spec: '5mg*10vials',
        category: allCategories[0] || 'GLP-1 & Metabolic',
        price: 99,
        stock: 'in_stock',
        purity: 99.5,
        testMethod: 'HPLC / MS',
        casNumber: '',
        description: '',
        tagsText: '',
        minOrderQuantity: 1,
        status: 'active',
        featured: false,
        coaUrl: '',
        volumePricing: [],
      });
      setImages([VIAL_PLACEHOLDER_SVG]);
      setActiveCoverIndex(0);
    }
    setShowUnsavedWarning(false);
  }, [editingProduct, reset, allCategories]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        handleAttemptClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, isDirty]);

  // Attempt to close drawer, warn if unsaved
  const handleAttemptClose = () => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      closeDrawer();
    }
  };

  // Generate Unique SKU suggestion
  const generateSku = () => {
    const currentName = watch('name')?.trim();
    const currentSpec = watch('spec')?.trim();

    let prefix = 'BIO';
    if (currentName) {
      prefix = currentName
        .replace(/[^A-Za-z0-9]/g, '')
        .substring(0, 4)
        .toUpperCase();
    }

    // Extract spec number (e.g. 5mg -> 5)
    let specPart = '';
    const numMatch = currentSpec.match(/\d+/);
    if (numMatch) {
      specPart = numMatch[0];
    }

    let candidate = `${prefix}${specPart}`;
    // Check if duplicate
    let counter = 1;
    while (
      products.some(
        (p) =>
          p.sku.toUpperCase() === candidate.toUpperCase() &&
          (!editingProduct || p.id !== editingProduct.id)
      )
    ) {
      candidate = `${prefix}${specPart}-${counter}`;
      counter++;
    }

    setValue('sku', candidate, { shouldValidate: true, shouldDirty: true });
  };

  // Handle image uploads
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (activeCoverIndex === index) {
      setActiveCoverIndex(0);
    } else if (activeCoverIndex > index) {
      setActiveCoverIndex((prev) => prev - 1);
    }
  };

  // Submit Handler
  const onSubmit = async (data: ProductFormData, overrideStatus?: 'active' | 'draft') => {
    setIsSubmitting(true);
    try {
      const targetStatus = overrideStatus || data.status;

      // Parse tags
      const parsedTags = data.tagsText
        ? data.tagsText
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const coverImage = images[activeCoverIndex] || images[0] || VIAL_PLACEHOLDER_SVG;

      const payload = {
        name: data.name.trim(),
        sku: data.sku.trim().toUpperCase(),
        spec: data.spec.trim(),
        category: data.category.trim(),
        price: Number(data.price),
        comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
        stock: data.stock as StockStatus,
        purity: Number(data.purity),
        testMethod: data.testMethod as any,
        casNumber: data.casNumber?.trim() || undefined,
        description: data.description?.trim() || undefined,
        tags: parsedTags,
        minOrderQuantity: Number(data.minOrderQuantity || 1),
        status: targetStatus,
        featured: Boolean(data.featured),
        image: coverImage,
        coaUrl: data.coaUrl?.trim() || undefined,
        volumePricing: data.volumePricing && data.volumePricing.length > 0 ? data.volumePricing : undefined,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      closeDrawer();
    } catch (err) {
      // Error is handled with toast in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleAttemptClose}
            className="fixed inset-0 bg-[#0A2358]/40 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel: 560px wide, full screen on mobile */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:w-[560px] bg-white h-full shadow-2xl flex flex-col z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {/* Header */}
            <div className="h-16 px-6 border-b border-[#E3EAF2] flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
              <div className="min-w-0">
                <h3 id="drawer-title" className="font-['Sora'] font-bold text-lg text-[#0A2358] truncate">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                {editingProduct && (
                  <p className="text-xs font-mono text-[#5F7088] truncate">
                    SKU: {editingProduct.sku}
                  </p>
                )}
              </div>

              <button
                onClick={handleAttemptClose}
                className="p-2 text-[#5F7088] hover:text-[#0A2358] hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Unsaved changes prompt */}
            {showUnsavedWarning && (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>You have unsaved changes. Discard them?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUnsavedWarning(false)}
                    className="font-medium hover:underline text-amber-800"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={closeDrawer}
                    className="font-bold text-red-600 hover:text-red-700 bg-white px-2 py-1 rounded shadow-xs"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            {/* Form Body (Scrollable) */}
            <form
              id="product-form"
              onSubmit={handleSubmit((data) => onSubmit(data as ProductFormData))}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-8"
            >
              {/* 1. Basic Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E3EAF2] pb-2">
                  <Info className="w-4 h-4 text-[#1C7FDB]" />
                  <h4 className="font-['Sora'] font-semibold text-sm text-[#0A2358]">
                    1. Basic Information
                  </h4>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      Product Name <span className="text-[#E5484D]">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="e.g. Tirzepatide, BPC-157, Retatrutide"
                      className="w-full h-10 px-3.5 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none transition-all"
                    />
                    {errors.name && (
                      <p className="text-xs text-[#E5484D] mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* SKU with Auto-generate */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#0A2358]">
                        Catalog SKU <span className="text-[#E5484D]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generateSku}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1C7FDB] hover:text-[#0A2358] transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-[#12B8A6]" />
                        Auto-generate
                      </button>
                    </div>
                    <input
                      type="text"
                      {...register('sku')}
                      placeholder="e.g. TRZ10, BPC5"
                      className="w-full h-10 px-3.5 font-mono text-sm uppercase bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none transition-all"
                    />
                    {errors.sku && (
                      <p className="text-xs text-[#E5484D] mt-1">{errors.sku.message}</p>
                    )}
                  </div>

                  {/* Specification */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      Specification <span className="text-[#E5484D]">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('spec')}
                      placeholder="e.g. 5mg*10vials, 10mg lyophilized cake"
                      className="w-full h-10 px-3.5 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none transition-all"
                    />
                    {errors.spec && (
                      <p className="text-xs text-[#E5484D] mt-1">{errors.spec.message}</p>
                    )}
                  </div>

                  {/* Category with "Create New" option */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      Category <span className="text-[#E5484D]">*</span>
                    </label>
                    {!isAddingNewCategory ? (
                      <div className="flex gap-2">
                        <select
                          {...register('category')}
                          className="flex-1 h-10 px-3 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none transition-all"
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
                          className="px-3 h-10 text-xs font-semibold text-[#1C7FDB] bg-[#EAF3FD] hover:bg-[#D5E7FA] rounded-xl transition-colors whitespace-nowrap"
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
                          placeholder="Enter new category name"
                          className="flex-1 h-10 px-3 text-sm bg-white border border-[#1C7FDB] rounded-xl outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCategoryInput.trim()) {
                              setValue('category', newCategoryInput.trim(), {
                                shouldDirty: true,
                              });
                              setIsAddingNewCategory(false);
                            }
                          }}
                          className="px-3 h-10 text-xs font-semibold text-white bg-[#12B8A6] rounded-xl"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewCategory(false)}
                          className="px-2.5 h-10 text-xs font-medium text-[#5F7088] bg-slate-100 rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {errors.category && (
                      <p className="text-xs text-[#E5484D] mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      Short Description
                    </label>
                    <textarea
                      rows={2}
                      {...register('description')}
                      placeholder="Synthetic research peptide, formulation purity details..."
                      className="w-full p-3 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      {...register('tagsText')}
                      placeholder="e.g. Metabolic, GLP-1, Healing, High Purity"
                      className="w-full h-10 px-3.5 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* 2. Pricing and Stock */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E3EAF2] pb-2">
                  <DollarSign className="w-4 h-4 text-[#12B8A6]" />
                  <h4 className="font-['Sora'] font-semibold text-sm text-[#0A2358]">
                    2. Pricing and Stock
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Unit Price */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      Unit Price (USD) <span className="text-[#E5484D]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-[#5F7088]">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        {...register('price')}
                        className="w-full h-10 pl-8 pr-3 font-mono text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none"
                      />
                    </div>
                    {errors.price && (
                      <p className="text-xs text-[#E5484D] mt-1">{errors.price.message}</p>
                    )}
                  </div>

                  {/* Compare Price */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      Compare Price (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-[#5F7088]">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        {...register('comparePrice')}
                        placeholder="Optional"
                        className="w-full h-10 pl-8 pr-3 font-mono text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Stock status */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      Stock Status
                    </label>
                    <select
                      {...register('stock')}
                      className="w-full h-10 px-3 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="low">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>

                  {/* Min order qty */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      Min Order Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      {...register('minOrderQuantity')}
                      className="w-full h-10 px-3 font-mono text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none"
                    />
                  </div>
                </div>

                {/* Volume Pricing Repeater */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#0A2358]">
                      Volume Wholesale Tiers
                    </span>
                    <button
                      type="button"
                      onClick={() => appendVolumeTier({ minQty: 5, discountPercent: 10 })}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1C7FDB] hover:text-[#0A2358]"
                    >
                      <Plus className="w-3 h-3" /> Add Tier
                    </button>
                  </div>

                  {volumeFields.length === 0 ? (
                    <p className="text-xs text-[#5F7088] italic">No volume discounts added.</p>
                  ) : (
                    <div className="space-y-2">
                      {volumeFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                          <input
                            type="number"
                            min={2}
                            {...register(`volumePricing.${index}.minQty`)}
                            placeholder="Min Qty (e.g. 10)"
                            className="w-1/2 h-9 px-3 text-xs font-mono border border-[#E3EAF2] rounded-xl"
                          />
                          <div className="relative w-1/2">
                            <input
                              type="number"
                              min={1}
                              max={90}
                              {...register(`volumePricing.${index}.discountPercent`)}
                              placeholder="Discount % (e.g. 15)"
                              className="w-full h-9 pl-3 pr-7 text-xs font-mono border border-[#E3EAF2] rounded-xl"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#5F7088]">
                              %
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVolumeTier(index)}
                            className="p-2 text-[#E5484D] hover:bg-red-50 rounded-lg"
                            title="Remove tier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* 3. Images */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E3EAF2] pb-2">
                  <ImageIcon className="w-4 h-4 text-[#1C7FDB]" />
                  <h4 className="font-['Sora'] font-semibold text-sm text-[#0A2358]">
                    3. Images & Vial Visuals
                  </h4>
                </div>

                <div className="space-y-3">
                  {/* Drag and Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#CBD5E1] hover:border-[#1C7FDB] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#F8FAFC] hover:bg-[#EAF3FD]/40"
                  >
                    <Upload className="w-6 h-6 mx-auto text-[#1C7FDB] mb-2" />
                    <p className="text-xs font-semibold text-[#0A2358]">
                      Click or drag images to upload
                    </p>
                    <p className="text-[11px] text-[#5F7088] mt-0.5">
                      Supports JPG, PNG, WEBP, SVG vials
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Thumbnail Previews */}
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {images.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden group ${
                          activeCoverIndex === idx
                            ? 'border-[#12B8A6] ring-2 ring-[#12B8A6]/20'
                            : 'border-[#E3EAF2]'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt={`Thumbnail ${idx}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {/* Make cover button */}
                        <button
                          type="button"
                          onClick={() => setActiveCoverIndex(idx)}
                          className="absolute inset-0 bg-[#0A2358]/60 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          {activeCoverIndex === idx ? 'Cover' : 'Set Cover'}
                        </button>
                        {/* Remove button */}
                        {images.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(idx);
                            }}
                            className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-0.5 shadow"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 4. Documentation & Compliance */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E3EAF2] pb-2">
                  <FileText className="w-4 h-4 text-[#12B8A6]" />
                  <h4 className="font-['Sora'] font-semibold text-sm text-[#0A2358]">
                    4. Documentation & Lab Specifications
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Purity */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      Certified Purity (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min={80}
                        max={100}
                        {...register('purity')}
                        className="w-full h-10 px-3 font-mono text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#5F7088]">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Test Method */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      Analytical Method
                    </label>
                    <select
                      {...register('testMethod')}
                      className="w-full h-10 px-3 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] outline-none"
                    >
                      <option value="HPLC / MS">HPLC / MS</option>
                      <option value="HPLC">HPLC</option>
                      <option value="MS">MS</option>
                      <option value="LC-MS">LC-MS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* CAS Number */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      CAS Registry Number
                    </label>
                    <input
                      type="text"
                      {...register('casNumber')}
                      placeholder="e.g. 2023788-19-2"
                      className="w-full h-10 px-3 font-mono text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] outline-none"
                    />
                  </div>

                  {/* COA Document URL */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                      COA Report URL
                    </label>
                    <input
                      type="url"
                      {...register('coaUrl')}
                      placeholder="https://.../coa.pdf"
                      className="w-full h-10 px-3 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* 5. Visibility */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E3EAF2] pb-2">
                  <Eye className="w-4 h-4 text-[#1C7FDB]" />
                  <h4 className="font-['Sora'] font-semibold text-sm text-[#0A2358]">
                    5. Visibility & Promotion
                  </h4>
                </div>

                <div className="space-y-3">
                  {/* Status: Active / Draft */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E3EAF2] bg-[#F8FAFC]">
                    <div>
                      <p className="text-xs font-semibold text-[#0A2358]">Catalog Status</p>
                      <p className="text-[11px] text-[#5F7088]">
                        Active items are immediately visible to clients on store catalog
                      </p>
                    </div>
                    <select
                      {...register('status')}
                      className="h-9 px-3 text-xs font-bold rounded-lg border border-[#E3EAF2] bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  {/* Featured Switch */}
                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E3EAF2] bg-[#F8FAFC] cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold text-[#0A2358]">Featured on Homepage</p>
                      <p className="text-[11px] text-[#5F7088]">
                        Showcase in the B2B high-demand peptides carousel
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      {...register('featured')}
                      className="w-4 h-4 rounded text-[#12B8A6] focus:ring-[#12B8A6] cursor-pointer"
                    />
                  </label>
                </div>
              </section>

              {/* 6. Live Storefront Card Preview */}
              <section className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-[#E3EAF2] pb-2">
                  <Eye className="w-4 h-4 text-[#12B8A6]" />
                  <h4 className="font-['Sora'] font-semibold text-sm text-[#0A2358]">
                    Live Storefront Preview
                  </h4>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F8FB] border border-[#E3EAF2]">
                  <p className="text-[11px] text-[#5F7088] mb-3 font-medium">
                    This is how this product will render on the BIOPEPTI B2B buyer portal:
                  </p>

                  <div className="bg-white rounded-2xl border border-[#E3EAF2] p-4 shadow-card max-w-xs mx-auto">
                    <div className="aspect-4/3 rounded-xl bg-slate-100 overflow-hidden mb-3 relative">
                      <img
                        src={images[activeCoverIndex] || VIAL_PLACEHOLDER_SVG}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-mono font-bold bg-[#0A2358]/80 text-white px-2 py-0.5 rounded-md">
                        {watchedPurity}% Purity
                      </span>
                      {watchedFeatured && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold bg-[#12B8A6] text-white px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    <h5 className="font-['Sora'] font-bold text-sm text-[#0A2358] truncate">
                      {watchedName}
                    </h5>
                    <p className="text-xs text-[#5F7088] font-medium mt-0.5">{watchedSpec}</p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E3EAF2]">
                      <div>
                        <span className="font-mono font-bold text-base text-[#0A2358]">
                          ${Number(watchedPrice || 0).toFixed(2)}
                        </span>
                        {watchedComparePrice && (
                          <span className="font-mono text-xs text-[#5F7088] line-through ml-2">
                            ${Number(watchedComparePrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#1C7FDB] bg-[#EAF3FD] px-2 py-0.5 rounded">
                        {watchedSku || 'SKU'}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </form>

            {/* Sticky Footer */}
            <div className="h-18 px-6 border-t border-[#E3EAF2] bg-white flex items-center justify-between shrink-0 gap-3">
              <button
                type="button"
                onClick={handleAttemptClose}
                className="px-4 py-2.5 text-xs font-semibold text-[#5F7088] hover:text-[#0A2358] hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit((data) => onSubmit(data as ProductFormData, 'draft'))}
                  className="px-4 py-2.5 text-xs font-semibold text-[#0A2358] bg-white border border-[#E3EAF2] hover:bg-[#F5F8FB] rounded-xl transition-colors shadow-xs"
                >
                  Save as Draft
                </button>

                <button
                  type="submit"
                  form="product-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-brand-gradient hover:opacity-95 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
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
