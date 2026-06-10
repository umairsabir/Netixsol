import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Grid2X2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/axios';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { CategoryModal } from '../../components/admin/CategoryModal';

const AdminCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const { data } = await api.get('/admin/categories');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      showToast('Category deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Failed to delete category', 'error');
      setDeleteId(null);
    },
  });

  const categories = data?.results || [];

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-text-p text-[28px] font-bold">Category Management</h1>
          <p className="text-text-s text-[14px] mt-1">Organize your movies and shows into dynamic categories.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-primary text-text-p font-semibold px-5 py-2.5 rounded-[8px] flex items-center gap-2 hover:bg-red-700 transition-colors w-fit shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="bg-surface border border-border-darker rounded-[12px] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border-darker bg-bg-darker/30 flex items-center gap-3">
          <div className="relative flex-1 max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-s" size={16} />
            <input 
              type="text" 
              placeholder="Search categories..."
              className="w-full bg-bg-custom border border-border-darker rounded-[8px] pl-10 pr-4 py-2 text-[14px] text-text-p outline-none focus:border-primary transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-darker bg-bg-darker/50">
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-text-s uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-darker">
              {isLoading ? (
                <tr>
                   <td colSpan={4} className="px-6 py-20 text-center">
                     <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                   </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-6 py-20 text-center text-text-s italic opacity-60">No categories found.</td>
                </tr>
              ) : categories.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-bg-darker/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-bg-custom rounded-[6px] flex items-center justify-center text-text-s border border-border-darker">
                        <Grid2X2 size={16} />
                      </div>
                      <span className="text-text-p text-[14px] font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-s text-[13px]">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cat.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {cat.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(cat)}
                        className="p-2 text-text-s hover:text-text-p hover:bg-surface rounded-[8px] transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteId(cat.id)}
                        className="p-2 text-text-s hover:text-primary hover:bg-primary/10 rounded-[8px] transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
      />

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Category?"
        message="Are you sure you want to delete this category? This might affect how movies are grouped on the home page."
        confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete Category'}
      />
    </div>
  );
};

export default AdminCategoriesPage;
