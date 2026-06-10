'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, ShoppingBag, Eye, Trash2, Filter, Clock, CheckCircle2, Truck, Package, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { Table, Button } from '../components';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    images: string[];
  };
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  _id: string;
  userId: User;
  items: OrderItem[];
  totalAmount: number;
  totalPoints: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data || []);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order? Only Super Admins can do this.')) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to delete order (ensure you have super_admin rights)');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.userId.name.toLowerCase().includes(search.toLowerCase()) || 
        o._id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || o.paymentMethod === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const headers = ['ORDER ID', 'CUSTOMER', 'DATE', 'TOTAL', 'STATUS', 'PAYMENT METHOD & STATUS', 'ACTIONS'];

  const rows = filteredOrders.map((o) => {
    const StatusIcon = statusIcons[o.status] || Clock;
    return [
      <div key={o._id} className="font-mono text-xs text-gray-500">
        #{o._id.slice(-8).toUpperCase()}
      </div>,
      <div key={o._id}>
        <div className="font-bold text-gray-900">{o.userId.name}</div>
        <div className="text-xs text-gray-500">{o.userId.email}</div>
      </div>,
      <div key={o._id} className="text-sm text-gray-600">
        {new Date(o.createdAt).toLocaleDateString()}
      </div>,
      <div key={o._id}>
        <div className="font-bold text-gray-900">${o.totalAmount.toLocaleString()}</div>
        {o.totalPoints > 0 && <div className="text-xs text-orange-600">+{o.totalPoints} pts</div>}
      </div>,
      <div key={o._id}>
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status]}`}>
          <StatusIcon className="w-3 h-3" />
          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
        </span>
      </div>,
      <div key={o._id} className="space-y-1">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
          o.paymentMethod === 'stripe' ? 'bg-violet-100 text-violet-700' :
          o.paymentMethod === 'points' ? 'bg-amber-100 text-amber-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {o.paymentMethod === 'stripe' ? '💳 Stripe' : o.paymentMethod === 'points' ? '⭐ Points' : '💵 COD'}
        </span>
        <div className={`text-xs font-semibold ${
          o.paymentStatus === 'paid' ? 'text-green-600' :
          o.paymentStatus === 'failed' ? 'text-red-600' :
          'text-yellow-600'
        }`}>
          {o.paymentStatus.toUpperCase()}
        </div>
        {o.stripePaymentIntentId && (
          <div className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]" title={o.stripePaymentIntentId}>
            {o.stripePaymentIntentId.slice(-12)}
          </div>
        )}
      </div>,
      <div key={o._id} className="flex gap-2">
        <button 
          onClick={() => router.push(`/admin/orders/${o._id}`)}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600 transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleDelete(o._id)}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600 transition-colors"
          title="Delete Order"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">Monitor and manage customer orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Orders</div>
            <div className="text-xl font-bold text-gray-900">{orders.length}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-xl font-bold text-gray-900">{orders.filter(o => o.status === 'pending').length}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-xl font-bold text-gray-900">{orders.filter(o => o.status === 'delivered').length}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select 
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none"
          >
            <option value="all">All Payments</option>
            <option value="stripe">Stripe</option>
            <option value="points">Points</option>
            <option value="cod">Cash on Delivery</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <p className="text-gray-500 font-medium">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-20 text-center text-gray-500">
            No orders found matching your criteria.
          </div>
        ) : (
          <Table headers={headers} rows={rows} />
        )}
      </div>
    </div>
  );
}
