import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, Trash2, Edit, Tag, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import api from '../../lib/axios';
import { DynamicListInput } from '../../components/admin/DynamicListInput';

const AdminPlansPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['adminPlans'],
    queryFn: async () => {
      const { data } = await api.get('/admin/plans');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/plans/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminPlans'] }),
  });

  const { register, handleSubmit, reset, control } = useForm();

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        price: Number(data.price),
        durationDays: Number(data.durationDays),
      };
      if (editingPlan) return api.patch(`/admin/plans/${editingPlan.id}`, payload);
      return api.post('/admin/plans', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      setModalOpen(false);
      reset();
    },
  });

  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    reset({
      name: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
      features: plan.features || [],
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingPlan(null);
    reset({ name: '', price: '', durationDays: 30, features: [] });
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-text-p text-[28px] font-bold">Subscription Plans</h1>
          <p className="text-text-s text-[14px] mt-1">Define pricing and features for users.</p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-primary text-text-p font-semibold px-5 py-2.5 rounded-[8px] flex items-center gap-2 hover:bg-red-700 transition-colors"
        >
          <Plus size={18} /> Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : plans.map((plan: any) => (
          <div key={plan.id} className="bg-surface border border-border-darker rounded-[12px] p-6 flex flex-col gap-5 group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-primary/10 rounded-[8px] flex items-center justify-center text-primary">
                <Tag size={24} />
              </div>
              <div className="flex gap-2">
                 <button onClick={() => openEdit(plan)} className="p-2 text-text-s hover:text-text-p hover:bg-bg-custom rounded-[8px]"><Edit size={16}/></button>
                 <button onClick={() => { if(confirm('Delete plan?')) deleteMutation.mutate(plan.id) }} className="p-2 text-text-s hover:text-primary hover:bg-bg-custom rounded-[8px]"><Trash2 size={16}/></button>
              </div>
            </div>
            <div>
              <h3 className="text-text-p text-[20px] font-bold">{plan.name}</h3>
              <p className="text-primary text-[28px] font-bold mt-1">${plan.price}<span className="text-text-s text-[14px] font-normal">/mo</span></p>
              <p className="text-text-s text-[12px]">{plan.durationDays} days</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {plan.features.map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-text-s text-[13px]">
                  <Check size={14} className="text-green-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Basic Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setModalOpen(false)} />
          <div className="bg-surface border border-border-darker rounded-[12px] w-full max-w-[480px] z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border-darker flex justify-between items-center">
               <h3 className="text-text-p text-[18px] font-bold">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
               <button onClick={() => setModalOpen(false)} className="text-text-s hover:text-text-p"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-text-p text-[13px] font-medium">Plan Name</label>
                <input {...register('name')} placeholder="e.g. Basic, Premium" required className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-2.5 text-text-p text-[14px] outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-text-p text-[13px] font-medium">Monthly Price ($)</label>
                <input {...register('price')} type="number" step="0.01" placeholder="9.99" required className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-2.5 text-text-p text-[14px] outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-text-p text-[13px] font-medium">Duration (Days)</label>
                <input {...register('durationDays')} type="number" placeholder="30" required className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-2.5 text-text-p text-[14px] outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Controller
                  name="features"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <DynamicListInput
                      label="Plan Features"
                      items={field.value}
                      onChange={field.onChange}
                      placeholder="e.g. 4K Resolution"
                    />
                  )}
                />
              </div>
              <button disabled={saveMutation.isPending} className="mt-4 bg-primary text-text-p font-semibold py-3 rounded-[8px] hover:bg-red-700 transition-colors disabled:opacity-60">
                {saveMutation.isPending ? 'Saving…' : 'Save Plan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlansPage;
