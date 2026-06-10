'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import api from '@/lib/api';
import { ShoppingBag, Package, Calendar, Clock, ChevronRight, CheckCircle2, Truck, AlertCircle, Wallet, CreditCard, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const statusConfig: any = {
  pending: { color: 'bg-orange-50 text-orange-600 border-orange-100', icon: Clock, label: 'Pending' },
  processing: { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Package, label: 'Processing' },
  shipped: { color: 'bg-purple-50 text-purple-600 border-purple-100', icon: Truck, label: 'Shipped' },
  delivered: { color: 'bg-green-50 text-green-600 border-green-100', icon: CheckCircle2, label: 'Delivered' },
  cancelled: { color: 'bg-red-50 text-red-600 border-red-100', icon: AlertCircle, label: 'Cancelled' },
};

const paymentMethodConfig: any = {
  stripe: { color: 'bg-violet-50 text-violet-600 border-violet-100', label: '💳 Stripe' },
  points: { color: 'bg-amber-50 text-amber-600 border-amber-100', label: '⭐ Points' },
  cod: { color: 'bg-gray-50 text-gray-600 border-gray-100', label: '💵 Cash on Delivery' },
};

const paymentStatusConfig: any = {
  paid: { color: 'bg-green-50 text-green-600 border-green-100', label: 'Paid' },
  pending: { color: 'bg-orange-50 text-orange-500 border-orange-100', label: 'Pending' },
  failed: { color: 'bg-red-50 text-red-600 border-red-100', label: 'Failed' },
  refunded: { color: 'bg-blue-50 text-blue-600 border-blue-100', label: 'Refunded' },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my-orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-[40px] border-2 border-gray-50">
        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-4xl font-black uppercase italic mb-2 tracking-tighter text-center">No orders yet</h2>
        <p className="text-gray-500 mb-8 max-w-xs text-center font-medium">Your order history will appear here once you've made a purchase.</p>
        <Link href="/shop">
          <Button className="bg-black hover:bg-gray-800 rounded-2xl px-12 h-14 font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105">
            Browse Shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
          <div className="w-2 h-8 bg-black rounded-full" />
          Recent Orders
        </h3>
      </div>

      <div className="space-y-8">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = status.icon;

          return (
            <div key={order._id} className="bg-white rounded-[2.5rem] border-2 border-gray-50 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
              {/* Order Header */}
              <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</p>
                    <p className="font-mono font-bold text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date Placed</p>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Amount</p>
                    <p className="font-black text-lg tracking-tighter">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment</p>
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${paymentMethodConfig[order.paymentMethod]?.color || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                      {paymentMethodConfig[order.paymentMethod]?.label || order.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-full border ${status.color} flex items-center gap-2 text-[10px] font-black uppercase tracking-widest`}>
                    <StatusIcon className="w-4 h-4" />
                    {status.label}
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${paymentStatusConfig[order.paymentStatus]?.color || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                    {paymentStatusConfig[order.paymentStatus]?.label || order.paymentStatus}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 md:p-8 space-y-6">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-6 items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 relative rounded-2xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                      <Image 
                        src={item.productId?.images?.[0] || '/placeholder.png'} 
                        alt={item.productId?.name || 'Product'} 
                        fill 
                        className="object-contain p-2" 
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-black uppercase italic tracking-tight text-md mb-1 truncate">{item.productId?.name || 'Product'}</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Qty: {item.quantity}</span>
                        {item.color && (
                          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                            • Color: <div className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: item.color.toLowerCase() }} /> {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">• Size: {item.size}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                       <p className="font-black text-sm tracking-tighter">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="p-6 md:p-8 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Points Gained</p>
                    <p className="font-black text-emerald-600">+{order.totalPointsAwarded || 0} LP</p>
                  </div>
                </div>

                <Link href={`/orders/${order._id}`}>
                  <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-black hover:text-white rounded-xl transition-all h-9">
                    Details
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
