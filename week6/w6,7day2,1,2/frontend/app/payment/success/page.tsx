'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { CheckCircle2, Package, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    // Poll for the confirmed order (webhook may take a moment)
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        const confirmed = res.data.find(
          (o: any) => o.paymentStatus === 'paid' && o.paymentMethod === 'stripe',
        );
        if (confirmed) {
          setOrder(confirmed);
          await refreshUser(); // Refresh points balance
          setLoading(false);
          return;
        }
      } catch (_) {}

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, 2000); // retry every 2s
      } else {
        setLoading(false); // Give up and show generic success
      }
    };

    poll();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F0F1]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl shadow-gray-200/50 text-center border border-gray-50">
          {/* Animated checkmark */}
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-green-100">
            <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={1.5} />
          </div>

          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.15em] text-[10px] mb-8">
            Your order has been confirmed
          </p>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Confirming order details...
              </p>
            </div>
          ) : order ? (
            <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8 border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Order ID</p>
              <p className="font-mono font-bold text-sm mb-4">#{order._id.slice(-8).toUpperCase()}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Amount Paid</p>
              <p className="font-black text-2xl tracking-tighter text-green-600">${order.totalAmount?.toFixed(2)}</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
              <p className="text-gray-500 text-sm font-bold">
                Your payment was received. Your order will appear in Orders shortly.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/orders">
              <Button className="w-full bg-black hover:bg-gray-800 rounded-2xl h-14 font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
                <Package className="w-5 h-5" />
                View My Orders
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="ghost" className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[11px]">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
