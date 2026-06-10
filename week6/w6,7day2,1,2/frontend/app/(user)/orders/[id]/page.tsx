'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Package, Truck, CheckCircle2, Clock, MapPin, ShoppingCart, Calendar, Phone, CreditCard } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import Image from 'next/image';

const statusSteps = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function UserOrderDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        toast.error('Failed to fetch order details');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
      </div>
    );
  }

  if (!order) return <div className="text-center p-20 font-black uppercase italic">Order not found</div>;

  const currentStepIndex = statusSteps.findIndex(s => s.id === order.status);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to History
          </button>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
            Order Detail
          </h2>
          <p className="font-mono text-[10px] text-gray-400 bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100 uppercase font-bold">#{order._id.slice(-12).toUpperCase()}</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-gray-50 shadow-sm">
           <Calendar className="w-5 h-5 text-gray-400" />
           <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Date</p>
              <p className="font-bold text-xs">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
           </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 shadow-sm">
         <div className="relative">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-black transition-all duration-1000" 
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {statusSteps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border transition-all duration-500 z-10 ${
                      isCurrent ? 'bg-black border-zinc-200 scale-110 shadow-lg' : 
                      isActive ? 'bg-black border-black' : 
                      'bg-white border-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-200'}`} />
                    </div>
                    <span className={`mt-3 text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-black' : 'text-gray-300'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Items */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
               <ShoppingCart className="w-5 h-5" />
               <h3 className="font-black uppercase italic tracking-tighter text-md">Ordered Items</h3>
            </div>
            <div className="divide-y-2 divide-gray-50 p-2">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex gap-6 items-center hover:bg-gray-50/20 transition-colors rounded-3xl">
                  <div className="w-20 h-20 bg-white rounded-2xl border border-gray-100 overflow-hidden flex-shrink-0 relative">
                    <Image src={item.productId?.images?.[0] || '/placeholder.png'} alt="" fill className="object-contain p-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black uppercase italic text-md leading-tight mb-2 truncate">{item.productId?.name || 'Product'}</h4>
                    <div className="flex flex-wrap gap-4">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Quantity</span>
                          <span className="font-bold text-xs">{item.quantity}</span>
                       </div>
                       {item.color && (
                         <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Color</span>
                            <div className="flex items-center gap-1.5 ">
                               <div className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: item.color.toLowerCase() }} />
                               <span className="font-bold text-[10px] uppercase">{item.color}</span>
                            </div>
                         </div>
                       )}
                       {item.size && (
                         <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Size</span>
                            <span className="font-bold text-[10px] uppercase">{item.size}</span>
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                     <p className="font-black text-md tracking-tighter">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price & Address Summary */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 shadow-sm">
              <h3 className="font-black uppercase italic tracking-tighter text-lg mb-6 flex items-center gap-2">
                 <CreditCard className="w-5 h-5 text-gray-400" /> Summary
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-black">${order.totalAmount.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <span>Earned Points</span>
                    <span>+{order.totalPointsAwarded || 0} LP</span>
                 </div>
                 <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Grand Total</span>
                    <span className="text-3xl font-black italic tracking-tighter text-black">${order.totalAmount.toFixed(2)}</span>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 shadow-sm">
              <h3 className="font-black uppercase italic tracking-tighter text-lg mb-6 flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-gray-400" /> Shipping
              </h3>
              <div className="space-y-6 text-sm">
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Delivery Address</p>
                    <p className="font-bold leading-relaxed">{order.shippingAddress.address}</p>
                    <p className="font-bold uppercase text-[10px] mt-1">{order.shippingAddress.city}</p>
                 </div>
                 <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-xs">{order.shippingAddress.phone}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
