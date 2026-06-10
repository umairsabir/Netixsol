'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const saleSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().gt(0, 'Discount must be greater than 0'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  targetType: z.enum(['all', 'category', 'product']),
  targetIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date must be after or same as start date",
  path: ["endDate"],
}).refine((data) => {
  if (data.discountType === 'percentage' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage cannot exceed 100%",
  path: ["discountValue"],
}).refine((data) => {
  if (data.targetType !== 'all' && (!data.targetIds || data.targetIds.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Please select at least one target (Category/Product)",
  path: ["targetType"],
});

export type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
  sale?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SaleForm({ sale, onSuccess, onCancel }: SaleFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ _id: string; name: string }[]>([]);
  const [fetchingData, setFetchingData] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: sale ? {
      ...sale,
      startDate: sale.startDate ? new Date(sale.startDate).toISOString().split('T')[0] : '',
      endDate: sale.endDate ? new Date(sale.endDate).toISOString().split('T')[0] : '',
    } : {
      discountType: 'percentage',
      targetType: 'all',
      isActive: true,
      targetIds: [],
    },
  });

  const targetType = watch('targetType');
  const selectedTargetIds = watch('targetIds') || [];

  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true);
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=1000')
        ]);
        setCategories(catsRes.data);
        setProducts(prodsRes.data.products);
      } catch (err) {
        toast.error('Failed to load targets');
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: SaleFormData) => {
    setLoading(true);
    try {
      if (sale?._id) {
        await api.put(`/sales/${sale._id}`, data);
        toast.success('Sale updated successfully');
      } else {
        await api.post('/sales', data);
        toast.success('Sale created successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleTargetToggle = (id: string) => {
    const current = [...selectedTargetIds];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setValue('targetIds', current);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sale Name</label>
          <input
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
            placeholder="e.g. Summer Clearance"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
          <select
            {...register('discountType')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition capitalize"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (PKR)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Value {watch('discountType') === 'percentage' ? '(%)' : '(PKR)'}
          </label>
          <input
            {...register('discountValue')}
            type="number"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
          />
          {errors.discountValue && <p className="text-red-500 text-xs mt-1">{errors.discountValue.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            {...register('startDate')}
            type="date"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
          />
          {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            {...register('endDate')}
            type="date"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
          />
          {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Apply To</label>
          <div className="flex gap-4">
            {['all', 'category', 'product'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={type}
                  {...register('targetType')}
                  className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                />
                <span className="text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
          {errors.targetType && <p className="text-red-500 text-xs mt-1">{errors.targetType.message}</p>}
        </div>

        {targetType !== 'all' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {targetType === 'category' ? 'Categories' : 'Products'}
            </label>
            {fetchingData ? (
              <div className="flex items-center gap-2 text-gray-500 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading selections...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-48 p-2 border border-gray-200 rounded-lg bg-gray-50">
                {(targetType === 'category' ? categories : products).map((item) => (
                  <label
                    key={item._id}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition ${
                      selectedTargetIds.includes(item._id) 
                        ? 'bg-black text-white' 
                        : 'bg-white hover:bg-gray-100 border border-transparent hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedTargetIds.includes(item._id)}
                      onChange={() => handleTargetToggle(item._id)}
                    />
                    <span className="text-xs truncate font-medium">{item.name}</span>
                  </label>
                ))}
              </div>
            )}
            {selectedTargetIds.length === 0 && (
              <p className="text-amber-600 text-xs mt-1 italic">
                * No selection made. This sale will not apply to anything.
              </p>
            )}
          </div>
        )}

        <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-700">Enable Sale</span>
            </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2 bg-black text-white rounded-xl hover:bg-zinc-800 transition font-bold flex items-center gap-2 min-w-[120px] justify-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (sale?._id ? 'Update Sale' : 'Create Sale')}
        </button>
      </div>
    </form>
  );
}
