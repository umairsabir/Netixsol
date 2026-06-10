'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Package, Truck, CheckCircle2, XCircle, Clock, CreditCard, MapPin, User, Mail, Phone, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '../../components';
import { toast } from 'sonner';

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    images: string[];
  };
  variant: any;
  quantity: number;
  color: string;
  size: string;
  priceAtPurchase: number;
  pointsAtPurchase: number;
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  totalPoints: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    address: string;
    city: string;
    phone: string;
  };
  createdAt: string;
}

const statusSteps = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrder();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { paymentStatus: newStatus });
      toast.success(`Payment status updated to ${newStatus}`);
      fetchOrder();
    } catch (err) {
      toast.error('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) return <div className="text-center p-10">Order not found</div>;

  const currentStepIndex = statusSteps.findIndex(s => s.id === order.status);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-none mb-1">Order Details</h1>
          <p className="text-sm text-gray-500 font-mono">#{order._id.toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Progress */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Status Progression</h3>
            <div className="relative">
              <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-black transition-all duration-500"
                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {statusSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors z-10 ${isCurrent ? 'bg-black border-zinc-200' :
                          isActive ? 'bg-black border-black' :
                            'bg-white border-gray-100'
                        }`}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-300'}`} />
                      </div>
                      <span className={`mt-2 text-xs font-semibold ${isActive ? 'text-black' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-700">
                <ShoppingCart className="w-4 h-4" />
                Items ({order.items.length})
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-6 flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.productId?.images?.[0] ? (
                      <img src={item.productId.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-full h-full p-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{item.productId?.name || 'Product Deleted'}</h4>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                      {item.color && (
                        <span className="bg-gray-100 px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1.5 font-bold">
                          Color: <div className="w-2 h-2 rounded-full border border-gray-300" style={{ backgroundColor: item.color.toLowerCase() }} /> {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span className="bg-gray-100 px-2 py-1 rounded uppercase tracking-wider font-bold">
                          Size: {item.size}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {item.quantity} x {item.priceAtPurchase > 0 ? `$${item.priceAtPurchase.toLocaleString()}` : `${item.pointsAtPurchase} points`}
                      </div>
                      <div className="font-bold text-gray-900">
                        {item.priceAtPurchase > 0
                          ? `$${(item.priceAtPurchase * item.quantity).toLocaleString()}`
                          : `${item.pointsAtPurchase * item.quantity} pts`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Points Used</span>
                  <span>{order.totalPoints} pts</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span>${order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Actions */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Management</h3>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Change Order Status</label>
              <select
                value={order.status}
                disabled={updating}
                onChange={(e) => updateStatus(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mt-4 mb-1">Change Payment Status</label>
              <select
                value={order.paymentStatus}
                disabled={updating}
                onChange={(e) => updatePaymentStatus(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Customer Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{order.userId?.name}</div>
                  <div className="text-xs text-gray-500">Member since {new Date((order.userId as any)?.createdAt || Date.now()).getFullYear()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-sm text-gray-600 truncate">{order.userId?.email}</div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Shipping Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div className="text-sm text-gray-600">
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                <Phone className="w-4 h-4 text-gray-400" />
                <div className="text-sm text-gray-600">{order.shippingAddress.phone}</div>
              </div>
              <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <div className="text-sm text-gray-600 uppercase font-medium">{order.paymentMethod}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
