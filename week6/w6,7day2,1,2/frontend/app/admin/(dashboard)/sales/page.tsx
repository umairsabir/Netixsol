'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Loader2, Search, Tag, Calendar, Target, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { Table, Modal } from '../components';
import SaleForm from '@/components/admin/SaleForm';
import { toast } from 'sonner';

interface Sale {
  _id: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  targetType: 'all' | 'category' | 'product';
  targetIds: string[];
  isActive: boolean;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [search, setSearch] = useState('');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sales');
      setSales(data || []);
    } catch (err) {
      toast.error('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleCreate = () => {
    setEditingSale(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;
    try {
      await api.delete(`/sales/${id}`);
      toast.success('Sale deleted successfully');
      fetchSales();
    } catch (err) {
      toast.error('Failed to delete sale');
    }
  };

  const onSuccess = () => {
    setIsModalOpen(false);
    fetchSales();
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [sales, search]);

  const headers = ['SALE NAME', 'DISCOUNT', 'STATUS', 'TARGET', 'DURATION', 'ACTIONS'];

  const rows = (filteredSales || []).map((s) => [
    <div key={s._id} className="flex items-center gap-3">
      <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
        <Tag className="w-5 h-5" />
      </div>
      <div>
        <div className="font-bold text-gray-900">{s.name}</div>
        <div className={`text-xs ${new Date(s.endDate) < new Date() ? 'text-red-500' : 'text-gray-500'}`}>
          {new Date(s.endDate) < new Date() ? 'Expired' : 'Active period'}
        </div>
      </div>
    </div>,
    <div key={s._id}>
      <span className="font-bold text-gray-900">
        {s.discountType === 'percentage' ? `${s.discountValue}%` : `$${s.discountValue}`}
      </span>
      <span className="text-xs text-gray-500 block">OFF</span>
    </div>,
    <div key={s._id}>
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {s.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {s.isActive ? 'Active' : 'Disabled'}
      </span>
    </div>,
    <div key={s._id} className="flex items-center gap-2 text-sm text-gray-600">
      <Target className="w-4 h-4 text-gray-400" />
      <span className="capitalize">{s.targetType}</span>
      {s.targetType !== 'all' && (
        <span className="bg-gray-100 px-1.5 py-0.25 rounded text-xs">
          {s.targetIds?.length || 0} items
        </span>
      )}
    </div>,
    <div key={s._id} className="text-xs text-gray-600 space-y-1">
      <div className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        <span>{s.startDate ? new Date(s.startDate).toLocaleDateString() : 'N/A'}</span>
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        <span>{s.endDate ? new Date(s.endDate).toLocaleDateString() : 'N/A'}</span>
      </div>
    </div>,
    <div key={s._id} className="flex gap-2">
      <button onClick={() => handleEdit(s)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600 transition-colors">
        <Edit className="w-4 h-4" />
      </button>
      <button onClick={() => handleDelete(s._id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600 transition-colors">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sale Engine</h1>
          <p className="text-gray-500 text-sm">Manage store-wide discounts and promotions</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create New Sale
        </button>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sales by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <p className="text-gray-500 font-medium">Loading sales...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No sales found</h3>
            <p className="text-gray-500 mb-6 max-w-xs mx-auto">Click "Create New Sale" to start a promotion.</p>
          </div>
        ) : (
          <Table headers={headers} rows={rows} />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSale ? 'Edit Sale' : 'Create Sale'}
        size="lg"
      >
        <SaleForm
          sale={editingSale}
          onSuccess={onSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
