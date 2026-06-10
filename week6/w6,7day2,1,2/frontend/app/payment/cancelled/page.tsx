'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { XCircle, Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function PaymentCancelledContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F2F0F1]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl shadow-gray-200/50 text-center border border-gray-50">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-red-100">
            <XCircle className="w-12 h-12 text-red-400" strokeWidth={1.5} />
          </div>

          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.15em] text-[10px] mb-8">
            No charge was made to your card
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8 border border-gray-100">
            <p className="text-gray-500 text-sm font-bold leading-relaxed">
              Your payment was not completed. Your cart items are still saved — you can go back and try again anytime.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/cart">
              <Button className="w-full bg-black hover:bg-gray-800 rounded-2xl h-14 font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
                <ShoppingCart className="w-5 h-5" />
                Return to Cart
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="ghost" className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
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

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
      </div>
    }>
      <PaymentCancelledContent />
    </Suspense>
  );
}
