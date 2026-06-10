'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X, Trash2, Upload, CircleX, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  level: number;
}

export interface ProductAttribute {
  attributeName: string;
  values: string[];
  isVariation: boolean;
}

export interface ProductVariant {
  attributes: Record<string, string>;
  price: number;
  discountedPrice?: number | null;
  stock?: number | null;
  image?: string | null;
  imageFile?: File | null;
  imagePreviewUrl?: string | null;
}

export interface Product {
  _id?: string;
  name: string;
  slug: string;
  price: number;
  discountedPrice?: number | null;
  description?: string;
  categoryId?: string | null;
  type: 'simple' | 'variable';
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  images: string[];
  stock?: number | null;
  manageStock: boolean;
  continueSelling: boolean;
  purchaseType: 'money' | 'points' | 'hybrid';
  pointsPrice?: number | null;
  pointsReward: number;
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const productSchema = z
  .object({
    name: z.string().min(1, 'Product name is required'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Only lowercase letters, numbers, hyphens'),
    price: z.number({ invalid_type_error: 'Price must be a number' }).min(0.01, 'Price must be > 0'),
    discountedPrice: z.union([z.number().min(0.01), z.literal(''), z.undefined()]).optional(),
    description: z.string().optional(),
    categoryId: z.string().nullable().optional(),
    type: z.enum(['simple', 'variable']),
    manageStock: z.boolean(),
    continueSelling: z.boolean().optional(),
    stock: z.union([z.number().min(0), z.null(), z.undefined()]).optional(),
    purchaseType: z.enum(['money', 'points', 'hybrid']),
    pointsPrice: z.union([z.number().min(0), z.null(), z.undefined()]).optional(),
    pointsReward: z.number().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    if (typeof data.discountedPrice === 'number' && data.discountedPrice >= data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Discounted price must be less than the original price',
        path: ['discountedPrice'],
      });
    }
  });

type FormData = z.infer<typeof productSchema>;

// ─── Variant Selection Sub-Component ─────────────────────────────────────────
function VariantTable({
  attributes,
  variants,
  setVariants,
  manageStock,
}: {
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
  manageStock: boolean;
}) {
  const variationAttrs = attributes.filter((a) => a.isVariation);

  const isCombinationExists = (attrs: Record<string, string>, excludeIndex = -1) => {
    const key = Object.entries(attrs)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    return variants.some((v, i) => {
      if (i === excludeIndex) return false;
      const vkey = Object.entries(v.attributes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, vv]) => `${k}:${vv}`)
        .join('|');
      return vkey === key;
    });
  };

  const addVariant = () => {
    const blank = variationAttrs.reduce<Record<string, string>>((acc, a) => {
      acc[a.attributeName] = '';
      return acc;
    }, {});
    setVariants((prev) => [
      ...prev,
      { attributes: blank, price: 0, discountedPrice: null, stock: manageStock ? 0 : null, image: null, imageFile: null, imagePreviewUrl: null },
    ]);
  };

  const removeVariant = (i: number) => {
    const v = variants[i];
    if (v.imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(v.imagePreviewUrl);
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  };

  const update = (i: number, field: keyof ProductVariant, val: any) => {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: val } : v)));
  };

  const updateAttr = (i: number, attrName: string, val: string) => {
    const newAttrs = { ...variants[i].attributes, [attrName]: val };
    const allFilled = Object.values(newAttrs).every((v) => v !== '');
    if (allFilled && isCombinationExists(newAttrs, i)) {
      alert('This combination already exists. Please select different values.');
      return;
    }
    update(i, 'attributes', newAttrs);
  };

  const handleImage = (i: number, file?: File) => {
    if (!file) return;
    const v = variants[i];
    if (v.imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(v.imagePreviewUrl);
    const url = URL.createObjectURL(file);
    setVariants((prev) => prev.map((vv, idx) => idx === i ? { ...vv, imageFile: file, imagePreviewUrl: url, image: null } : vv));
  };

  const removeImage = (i: number) => {
    const v = variants[i];
    if (v.imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(v.imagePreviewUrl);
    setVariants((prev) => prev.map((vv, idx) => idx === i ? { ...vv, imageFile: null, imagePreviewUrl: null, image: null } : vv));
  };

  if (variationAttrs.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">Add attributes marked as "Is Variation" to create variants.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Product Variants</span>
        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6 border-2 border-dashed border-gray-200 rounded-lg">
          No variants yet. Click "Add Variant" to start.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left w-16">Image</th>
                {variationAttrs.map((a) => (
                  <th key={a.attributeName} className="px-3 py-2 text-left capitalize">{a.attributeName}</th>
                ))}
                <th className="px-3 py-2 text-left">Price</th>
                <th className="px-3 py-2 text-left">Sale Price</th>
                {manageStock && <th className="px-3 py-2 text-left">Stock</th>}
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map((variant, vi) => {
                const img = variant.imagePreviewUrl || variant.image;
                return (
                  <tr key={vi} className="hover:bg-gray-50/50">
                    {/* Image */}
                    <td className="px-3 py-2">
                      <label htmlFor={`vimg-${vi}`} className="cursor-pointer block">
                        {img ? (
                          <div className="relative w-10 h-10">
                            <img src={img} className="w-10 h-10 rounded object-cover" alt="" />
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(vi); }}
                              className="absolute -top-1 -right-1"
                            >
                              <CircleX className="w-3.5 h-3.5 text-red-500 bg-white rounded-full" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-gray-400 transition">
                            <Upload className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        )}
                        <input type="file" id={`vimg-${vi}`} accept="image/*" className="hidden" onChange={(e) => handleImage(vi, e.target.files?.[0])} />
                      </label>
                    </td>

                    {/* Attribute selects */}
                    {variationAttrs.map((attr) => (
                      <td key={attr.attributeName} className="px-3 py-2">
                        <select
                          value={variant.attributes[attr.attributeName] || ''}
                          onChange={(e) => updateAttr(vi, attr.attributeName, e.target.value)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                        >
                          <option value="">Select...</option>
                          {attr.values.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </td>
                    ))}

                    {/* Price */}
                    <td className="px-3 py-2">
                      <input
                        type="number" min="0" step="0.01"
                        value={variant.price || ''}
                        onChange={(e) => update(vi, 'price', parseFloat(e.target.value) || 0)}
                        className="w-24 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                        placeholder="0"
                      />
                    </td>

                    {/* Sale price */}
                    <td className="px-3 py-2">
                      <input
                        type="number" min="0" step="0.01"
                        value={variant.discountedPrice ?? ''}
                        onChange={(e) => update(vi, 'discountedPrice', e.target.value === '' ? null : parseFloat(e.target.value))}
                        className="w-24 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                        placeholder="—"
                      />
                    </td>

                    {/* Stock */}
                    {manageStock && (
                      <td className="px-3 py-2">
                        <input
                          type="number" min="0"
                          value={variant.stock ?? ''}
                          onChange={(e) => update(vi, 'stock', e.target.value === '' ? 0 : parseInt(e.target.value))}
                          className="w-20 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                          placeholder="0"
                        />
                      </td>
                    )}

                    {/* Remove */}
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => removeVariant(vi)} className="text-red-400 hover:text-red-600 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Attribute Builder Sub-Component ─────────────────────────────────────────
function AttributeBuilder({
  attributes,
  setAttributes,
}: {
  attributes: ProductAttribute[];
  setAttributes: React.Dispatch<React.SetStateAction<ProductAttribute[]>>;
}) {
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newIsVariation, setNewIsVariation] = useState(false);
  const [editingValues, setEditingValues] = useState<Record<number, string>>({});

  const addAttr = () => {
    if (!newName.trim()) return;
    setAttributes((prev) => [...prev, { attributeName: newName.trim(), values: [], isVariation: newIsVariation }]);
    setNewName('');
    setNewIsVariation(false);
  };

  const removeAttr = (i: number) => setAttributes((prev) => prev.filter((_, idx) => idx !== i));

  const addValue = (i: number) => {
    const val = (editingValues[i] || '').trim().toLowerCase();
    if (!val) return;
    if (attributes[i].values.includes(val)) return;
    setAttributes((prev) => prev.map((a, idx) => idx === i ? { ...a, values: [...a.values, val] } : a));
    setEditingValues((prev) => ({ ...prev, [i]: '' }));
  };

  const removeValue = (attrIdx: number, valIdx: number) => {
    setAttributes((prev) => prev.map((a, idx) => idx === attrIdx ? { ...a, values: a.values.filter((_, vi) => vi !== valIdx) } : a));
  };

  const toggleVariation = (i: number) => {
    setAttributes((prev) => prev.map((a, idx) => idx === i ? { ...a, isVariation: !a.isVariation } : a));
  };

  return (
    <div className="space-y-3">
      {/* Existing attributes */}
      {attributes.map((attr, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm capitalize">{attr.attributeName}</span>
              <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={attr.isVariation} onChange={() => toggleVariation(i)} className="rounded" />
                Is Variation
              </label>
            </div>
            <button type="button" onClick={() => removeAttr(i)} className="text-red-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Values */}
          <div className="flex flex-wrap gap-1.5">
            {attr.values.map((v, vi) => (
              <span key={vi} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
                {v}
                <button type="button" onClick={() => removeValue(i, vi)} className="text-gray-400 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add value */}
          <div className="flex gap-2">
            <input
              type="text"
              value={editingValues[i] || ''}
              onChange={(e) => setEditingValues((prev) => ({ ...prev, [i]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addValue(i); } }}
              placeholder="Add value..."
              className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <button
              type="button"
              onClick={() => addValue(i)}
              className="px-2 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 transition"
            >
              Add
            </button>
          </div>
        </div>
      ))}

      {/* Add new attribute */}
      <div className="border border-dashed border-gray-300 rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add Attribute</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Attribute name (e.g. Size, Color)"
            className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap cursor-pointer">
            <input type="checkbox" checked={newIsVariation} onChange={(e) => setNewIsVariation(e.target.checked)} className="rounded" />
            Is Variation
          </label>
          <button
            type="button"
            onClick={addAttr}
            disabled={!newName.trim()}
            className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ProductForm ─────────────────────────────────────────────────────────
interface ProductFormProps {
  product?: Product;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isUpdate = !!product;
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>(product?.attributes || []);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      price: product?.price || 0,
      discountedPrice: product?.discountedPrice ?? '',
      description: product?.description || '',
      categoryId: product?.categoryId || '',
      type: product?.type || 'simple',
      manageStock: product?.manageStock || false,
      continueSelling: product?.continueSelling || false,
      stock: product?.stock ?? null,
      purchaseType: product?.purchaseType || 'money',
      pointsPrice: product?.pointsPrice ?? null,
      pointsReward: product?.pointsReward || 0,
    },
  });

  const watchName = watch('name');
  const watchType = watch('type');
  const watchManageStock = watch('manageStock');
  const watchPurchaseType = watch('purchaseType');

  // Load categories
  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  // Auto-generate slug
  useEffect(() => {
    if (!isUpdate) {
      const slug = watchName
        ?.toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      if (slug) setValue('slug', slug);
    }
  }, [watchName, isUpdate, setValue]);

  // Clear variants when switching to simple
  useEffect(() => {
    if (watchType === 'simple') setVariants([]);
  }, [watchType]);

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewImagePreviews((prev) => [...prev, ...previews]);
    e.target.value = '';
  };

  const removeExistingImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const removeNewImage = (i: number) => {
    URL.revokeObjectURL(newImagePreviews[i]);
    setNewImageFiles((prev) => prev.filter((_, idx) => idx !== i));
    setNewImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (data: FormData) => {
    if (!isUpdate && images.length + newImageFiles.length === 0) {
      toast.error('At least one product image is required');
      return;
    }
    if (data.type === 'variable' && variants.length === 0) {
      toast.error('Variable products need at least one variant');
      return;
    }

    setLoading(true);
    try {
      // For simplicity: convert image files to base64 data URLs (no cloud storage needed)
      const newImageUrls: string[] = await Promise.all(
        newImageFiles.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(file);
            }),
        ),
      );

      // Also convert variant image files
      const processedVariants = await Promise.all(
        variants.map(async (v) => {
          let imageUrl = v.image;
          if (v.imageFile) {
            imageUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(v.imageFile!);
            });
          }
          return {
            attributes: v.attributes,
            price: v.price,
            discountedPrice: v.discountedPrice,
            stock: v.stock,
            image: imageUrl,
          };
        }),
      );

      const payload = {
        ...data,
        discountedPrice: data.discountedPrice === '' ? null : data.discountedPrice,
        images: [...images, ...newImageUrls],
        attributes,
        variants: data.type === 'variable' ? processedVariants : [],
      };

      let result;
      if (isUpdate && product?._id) {
        const res = await api.put(`/products/${product._id}`, payload);
        result = res.data;
        toast.success('Product updated successfully');
      } else {
        const res = await api.post('/products', payload);
        result = res.data;
        toast.success('Product created successfully');
      }
      onSuccess?.(result);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

      {/* ── Basic Info ─────────────────────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
            <input {...register('name')} placeholder="e.g. Classic Running Shoe" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Slug *</label>
            <input {...register('slug')} placeholder="classic-running-shoe" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900" />
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select {...register('categoryId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="">-- No Category --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.level === 1 ? `  ↳ ${c.name}` : c.name}</option>
              ))}
            </select>
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Type</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="simple" {...register('type')} className="accent-gray-900" />
                <span className="text-sm">Simple</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="variable" {...register('type')} className="accent-gray-900" />
                <span className="text-sm">Variable</span>
              </label>
            </div>
          </div>

          {/* Description - full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={3} placeholder="Product description..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Price (PKR) *</label>
            <input type="number" min="0" step="0.01" {...register('price', { valueAsNumber: true })} placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sale Price (PKR)</label>
            <input
              type="number" min="0" step="0.01"
              placeholder="Leave empty for no sale"
              {...register('discountedPrice', {
                setValueAs: (v) => (v === '' ? '' : Number(v)),
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            {errors.discountedPrice && <p className="text-red-500 text-xs mt-1">{errors.discountedPrice.message as string}</p>}
          </div>
        </div>
      </section>

      {/* ── Loyalty Points ─────────────────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Loyalty Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Purchase Type</label>
            <select {...register('purchaseType')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="money">Money only</option>
              <option value="points">Points only</option>
              <option value="hybrid">Hybrid (money or points)</option>
            </select>
          </div>

          {(watchPurchaseType === 'points' || watchPurchaseType === 'hybrid') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Points Price</label>
              <input
                type="number" min="0"
                {...register('pointsPrice', { valueAsNumber: true })}
                placeholder="Cost in points"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Points Reward on Purchase</label>
            <input
              type="number" min="0"
              {...register('pointsReward', { valueAsNumber: true })}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </section>

      {/* ── Stock ──────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Inventory</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('manageStock')} className="w-4 h-4 accent-gray-900 rounded" />
            <span className="text-sm font-medium">Manage Stock</span>
          </label>
          {watchManageStock && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('continueSelling')} className="w-4 h-4 accent-gray-900 rounded" />
              <span className="text-sm font-medium">Continue selling when out of stock</span>
            </label>
          )}
        </div>

        {watchManageStock && watchType === 'simple' && (
          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Quantity</label>
            <input
              type="number" min="0"
              {...register('stock', { valueAsNumber: true })}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        )}
      </section>

      {/* ── Images ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Product Images {!isUpdate && '*'}</h3>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-gray-400 transition">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">Click to upload images</span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddImages} />
        </label>

        {(images.length > 0 || newImagePreviews.length > 0) && (
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={`existing-${i}`} className="relative group">
                <img src={url} className="w-24 h-24 rounded-lg object-cover border border-gray-200" alt="" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            ))}
            {newImagePreviews.map((url, i) => (
              <div key={`new-${i}`} className="relative group">
                <img src={url} className="w-24 h-24 rounded-lg object-cover border border-gray-200" alt="" />
                <div className="absolute inset-0 bg-blue-500/10 rounded-lg border-2 border-blue-400" />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Attributes ─────────────────────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Product Attributes</h3>
        <AttributeBuilder attributes={attributes} setAttributes={setAttributes} />
      </section>

      {/* ── Variants (only for variable) ───────────────────────────────────── */}
      {watchType === 'variable' && (
        <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-gray-900">Variants</h3>
          <p className="text-xs text-gray-500">Mark attributes as "Is Variation" above to configure variants.</p>
          <VariantTable
            attributes={attributes}
            variants={variants}
            setVariants={setVariants}
            manageStock={watchManageStock}
          />
        </section>
      )}

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isUpdate ? 'Update Product' : 'Create Product'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
