'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, Loader2, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  parentId?: string | null;
  level: number;
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const createSchema = (isUpdate: boolean) =>
  z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Only lowercase letters, numbers, hyphens'),
    description: z.string().optional(),
    image: z.any().optional(),
    parentId: z.string().nullable().optional(),
  });

type FormData = z.infer<ReturnType<typeof createSchema>>;

// ─── Component ────────────────────────────────────────────────────────────────
interface CategoryFormProps {
  category?: Category;
  categories?: Category[]; // for parent dropdown
  onSuccess?: (category: Category) => void;
  onCancel?: () => void;
}

export default function CategoryForm({
  category,
  categories = [],
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const isUpdate = !!category;
  const [loading, setLoading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(category?.imageUrl || '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createSchema(isUpdate)),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      image: undefined,
      parentId: category?.parentId || null,
    },
  });

  const nameValue = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (!isUpdate) {
      const autoSlug = nameValue
        ?.toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      if (autoSlug) setValue('slug', autoSlug);
    }
  }, [nameValue, isUpdate, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file, { shouldValidate: true });
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const removeImage = () => {
    setValue('image', undefined, { shouldValidate: true });
    setImagePreviewUrl('');
    // We don't wipe the file input itself directly but this handles validation
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      if (data.description) formData.append('description', data.description);
      // Empty parentId or string "null" means null
      if (data.parentId && data.parentId !== '') {
        formData.append('parentId', data.parentId);
      }
      
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }
      
      let result;
      if (isUpdate && category) {
        const res = await api.put(`/categories/${category._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        result = res.data;
        toast.success('Category updated successfully');
      } else {
        const res = await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        result = res.data;
        toast.success('Category created successfully');
      }
      onSuccess?.(result);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const mainCategories = categories.filter((c) => c.level === 0 && c._id !== category?._id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name *</label>
        <input
          {...register('name')}
          placeholder="e.g. Running Shoes"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Slug *</label>
        <input
          {...register('slug')}
          placeholder="running-shoes"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
        />
        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Optional description..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Category Image {(!isUpdate) && '*'}</label>
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 flex flex-col items-center justify-center transition-colors hover:border-gray-300 hover:bg-gray-100 relative group">
          {imagePreviewUrl ? (
            <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-black/5">
              <Image 
                src={imagePreviewUrl} 
                alt="Upload preview" 
                fill 
                className="object-contain" 
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Click to upload image</p>
                <p className="text-xs text-gray-400">JPG, PNG or WEBP (max. 2MB)</p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="hidden" 
              />
            </label>
          )}
        </div>
      </div>

      {/* Parent Category */}
      {mainCategories.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Category (optional)</label>
          <select
            {...register('parentId')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">-- None (Top-level) --</option>
            {mainCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isUpdate ? 'Update Category' : 'Create Category'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
