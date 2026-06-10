'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Loader2, Upload, X, Wallet, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  pointsPrice: z.number().min(0).optional().nullable(),
  pointsReward: z.number().min(0, 'Points reward must be positive'),
  purchaseType: z.enum(['money', 'points', 'hybrid']),
  categoryId: z.string().min(1, 'Category is required'),
  stock: z.number().min(0, 'Stock must be positive'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  productId?: string;
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Images
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([]);
  
  // Color to Image Mapping
  // We store as imagePath -> colorName locally for easier UI management
  const [imageColorMap, setImageColorMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (initialData?.colorImages) {
        // colorImages is { colorName: [url1, url2] }
        Object.entries(initialData.colorImages).forEach(([color, urls]: [string, any]) => {
            urls.forEach((url: string) => {
                map[url] = color;
            });
        });
    }
    return map;
  });

  // Colors & Sizes as simple tag arrays
  const [colors, setColors] = useState<string[]>(initialData?.colors || []);
  const [sizes, setSizes] = useState<string[]>(initialData?.sizes || []);
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      purchaseType: initialData?.purchaseType || 'money',
      price: initialData?.price || 0,
      pointsPrice: initialData?.pointsPrice ?? null,
      pointsReward: initialData?.pointsReward || 0,
      stock: initialData?.stock || 0,
      categoryId: '',
    },
  });

  const nameValue = watch('name');
  const purchaseType = watch('purchaseType');

  // auto slug from name
  useEffect(() => {
    if (!productId && nameValue) {
      const autoSlug = nameValue.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      setValue('slug', autoSlug);
    }
  }, [nameValue, productId, setValue]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
        if (initialData?.categoryId) {
          const catId = typeof initialData.categoryId === 'object' ? initialData.categoryId._id : initialData.categoryId;
          setValue('categoryId', catId);
        }
      } catch {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, [initialData, setValue]);

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewImages(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setNewImagePreviewUrls(prev => [...prev, ...urls]);
    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);

    const updatedUrls = [...newImagePreviewUrls];
    const urlToRemove = updatedUrls[index];
    URL.revokeObjectURL(urlToRemove);
    updatedUrls.splice(index, 1);
    setNewImagePreviewUrls(updatedUrls);

    // Also remove from color map
    const newMap = { ...imageColorMap };
    delete newMap[urlToRemove];
    setImageColorMap(newMap);
  };

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(x => x !== url));
    const newMap = { ...imageColorMap };
    delete newMap[url];
    setImageColorMap(newMap);
  };

  const assignColorToImage = (imageUrl: string, color: string) => {
    setImageColorMap(prev => ({
      ...prev,
      [imageUrl]: color
    }));
  };

  const PRESET_COLORS = [
    { name: 'Green', hex: '#00AA44' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Yellow', hex: '#FFD700' },
    { name: 'Orange', hex: '#FF8800' },
    { name: 'Cyan', hex: '#00AAFF' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Purple', hex: '#AA00FF' },
    { name: 'Pink', hex: '#FF00FF' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#000000' },
  ];
  const PRESET_SIZES = ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'];

  const toggleColor = (c: string) => {
    setColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const toggleSize = (s: string) => {
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const addColor = () => {
    const val = newColor.trim();
    if (!val || colors.includes(val)) return;
    setColors(prev => [...prev, val]);
    setNewColor('');
  };

  const addSize = () => {
    const val = newSize.trim();
    if (!val || sizes.includes(val)) return;
    setSizes(prev => [...prev, val]);
    setNewSize('');
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value.toString());
      });

      formData.append('colors', JSON.stringify(colors));
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('existingImages', JSON.stringify(existingImages));

      // Build the colorImages map for the backend
      // Backend expects { "Red": ["url1", "url2"], "Blue": ["url3"] }
      const finalColorImages: Record<string, string[]> = {};
      
      // Note: For new images, we need to handle them after upload on the backend OR pass temporary mappings.
      // Since new images don't have URLs yet, we pass a special mapping: index -> colorName
      const newImageColorIndexes: Record<number, string> = {};
      newImages.forEach((_, idx) => {
        const tempUrl = newImagePreviewUrls[idx];
        if (imageColorMap[tempUrl]) {
           newImageColorIndexes[idx] = imageColorMap[tempUrl];
        }
      });
      formData.append('newImageColorIndexes', JSON.stringify(newImageColorIndexes));

      // For existing images, we can just pass the mapping directly
      const existingColorImages: Record<string, string[]> = {};
      existingImages.forEach(url => {
        const color = imageColorMap[url];
        if (color) {
          if (!existingColorImages[color]) existingColorImages[color] = [];
          existingColorImages[color].push(url);
        }
      });
      formData.append('colorImages', JSON.stringify(existingColorImages));

      newImages.forEach(file => formData.append('productImages', file));

      if (productId) {
        await api.put(`/products/${productId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created successfully');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
           {/* Basic Info (Name, Slug, Price, Stock, Category, Payment Type) */}
           <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Product Name *</label>
            <input {...register('name')} className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-5 py-4 font-bold outline-none transition-all" placeholder="e.g. Classic Cotton T-Shirt" />
            {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Slug *</label>
            <input {...register('slug')} className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-5 py-3 font-mono text-sm outline-none transition-all" />
            {errors.slug && <p className="text-red-500 text-xs font-bold">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Description *</label>
            <textarea {...register('description')} rows={4} className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-5 py-4 font-bold outline-none transition-all resize-none" />
            {errors.description && <p className="text-red-500 text-xs font-bold">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-500">Price ($) *</label>
              <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-5 py-4 font-bold outline-none transition-all" />
              {errors.price && <p className="text-red-500 text-xs font-bold">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-500">Stock *</label>
              <input type="number" {...register('stock', { valueAsNumber: true })} className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-5 py-4 font-bold outline-none transition-all" />
              {errors.stock && <p className="text-red-500 text-xs font-bold">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-500">Category *</label>
              <select {...register('categoryId')} className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-5 py-4 font-bold outline-none transition-all appearance-none">
                <option value="">Select Category</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-500">Payment Type</label>
              <select {...register('purchaseType')} className="w-full bg-purple-50 text-purple-900 border-2 border-transparent focus:border-purple-500 rounded-2xl px-5 py-4 font-black outline-none transition-all appearance-none">
                <option value="money">Money Only</option>
                <option value="points">Points Only</option>
                <option value="hybrid">Both (Hybrid)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Loyalty Settings */}
          <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-4">
              <h3 className="text-blue-600 font-black uppercase italic tracking-tight flex items-center gap-2">
                <Wallet className="w-5 h-5" /> Loyalty Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Points Price (LP)</label>
                    <input type="number" {...register('pointsPrice', { valueAsNumber: true })} className="w-full bg-white border-2 border-transparent focus:border-blue-500 rounded-xl px-4 py-3 font-bold outline-none transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Reward Points (LP)</label>
                    <input type="number" {...register('pointsReward', { valueAsNumber: true })} className="w-full bg-white border-2 border-transparent focus:border-blue-500 rounded-xl px-4 py-3 font-bold outline-none transition-all" />
                 </div>
              </div>
          </div>

          {/* New Enhanced Image Section with Color Assignment */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="text-sm font-black uppercase tracking-widest text-gray-500">Product Images *</label>
                <span className="text-[10px] font-bold text-gray-400 italic">Tip: Assign colors to images below</span>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6">
              <label className="flex flex-col items-center justify-center w-full cursor-pointer gap-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                  <Upload className="w-5 h-5 text-gray-800" />
                </div>
                <p className="text-sm font-bold text-gray-900">Click to upload images</p>
                <input type="file" accept="image/*" multiple onChange={handleProductImageChange} className="hidden" />
              </label>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Existing Images */}
              {existingImages.map((url, i) => (
                <div key={`ex-${i}`} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                    <img src={url} alt="existing" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md shadow-lg h-6 w-6 flex items-center justify-center">
                       <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Link to Color</label>
                    <select 
                      value={imageColorMap[url] || ''} 
                      onChange={(e) => assignColorToImage(url, e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="">Global (All Colors)</option>
                      {colors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              ))}

              {/* New Images */}
              {newImagePreviewUrls.map((url, i) => (
                <div key={`new-${i}`} className="flex items-center gap-4 bg-blue-50/30 p-3 rounded-2xl border border-blue-100 group animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative border-2 border-blue-200">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md shadow-lg h-6 w-6 flex items-center justify-center">
                       <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Link to Color</label>
                    <select 
                      value={imageColorMap[url] || ''} 
                      onChange={(e) => assignColorToImage(url, e.target.value)}
                      className="w-full bg-white border-2 border-blue-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-400"
                    >
                      <option value="">Global (All Colors)</option>
                      {colors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Colors & Sizes Tag Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
        <div className="space-y-4">
          <h3 className="text-xl font-black uppercase italic tracking-tighter">Manage Colors</h3>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button key={c.name} type="button" onClick={() => toggleColor(c.name)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2 ${colors.includes(c.name) ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} /> {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-black uppercase italic tracking-tighter">Manage Sizes</h3>
          <div className="flex flex-wrap gap-2">
            {PRESET_SIZES.map((s) => (
              <button key={s} type="button" onClick={() => toggleSize(s)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${sizes.includes(s) ? 'bg-black text-white border-black shadow-lg' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 flex justify-end gap-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={() => router.back()} className="rounded-xl px-8 h-12 font-bold uppercase tracking-widest">Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-gray-800 rounded-xl px-12 h-12 font-bold uppercase tracking-widest shadow-lg">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : productId ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
