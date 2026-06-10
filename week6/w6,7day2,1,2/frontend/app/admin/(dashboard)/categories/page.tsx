'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, ChevronRight, Folder, LayoutGrid } from 'lucide-react';
import api from '@/lib/api';
import { Table, Button, Modal } from '../components';
import CategoryForm, { Category } from '@/components/admin/CategoryForm';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const onSuccess = () => {
    setIsModalOpen(false);
    fetchCategories();
  };

  const mainCategories = categories.filter(c => c.level === 0);
  const subCategories = categories.filter(c => c.level === 1);

  const headers = ['NAME', 'SLUG', 'LEVEL', 'PARENT', 'ACTIONS'];
  
  const rows = categories.map((cat) => [
    <div key={cat._id} className="flex items-center gap-3">
      {cat.level === 0 ? <LayoutGrid className="w-4 h-4 text-blue-500" /> : <Folder className="w-4 h-4 text-orange-400 ml-4" />}
      <span className="font-semibold">{cat.name}</span>
    </div>,
    <code key={cat._id} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{cat.slug}</code>,
    <span key={cat._id} className={`px-2 py-0.5 rounded-full text-xs font-bold ${cat.level === 0 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
      {cat.level === 0 ? 'Main' : 'Sub'}
    </span>,
    <span key={cat._id} className="text-gray-500 text-sm">
      {cat.parentId ? mainCategories.find(c => c._id === cat.parentId)?.name || 'Unknown' : '—'}
    </span>,
    <div key={cat._id} className="flex gap-2">
      <button onClick={() => handleEdit(cat)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600 transition-colors">
        <Edit className="w-4 h-4" />
      </button>
      <button onClick={() => handleDelete(cat._id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600 transition-colors">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm">Manage your product categorization</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <p className="text-gray-500 font-medium">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No categories found</h3>
            <p className="text-gray-500 mb-6 max-w-xs mx-auto">Get started by creating your first product category.</p>
            <Button label="Create Category" onClick={handleCreate} />
          </div>
        ) : (
          <Table headers={headers} rows={rows} />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <CategoryForm
          category={editingCategory}
          categories={categories}
          onSuccess={onSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
