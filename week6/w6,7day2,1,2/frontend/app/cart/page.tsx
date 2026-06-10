'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight, Wallet, ShoppingBag, Loader2, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useQueryState from '@/hooks/useQueryState';
import { Suspense } from 'react';

function CartPageContent() {
  const { cart, removeFromCart, updateQuantity, toggleUsePoints, totalAmount, totalPointsRequired, totalPointsToEarn, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useQueryState('address', '');
  const [city, setCity] = useQueryState('city', '');
  const [phone, setPhone] = useQueryState('phone', '');

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      const dataParams = new URLSearchParams({ 
        address: JSON.stringify(address), 
        city: JSON.stringify(city), 
        phone: JSON.stringify(phone) 
      }).toString();
      router.push(`/login?callbackUrl=${encodeURIComponent(`/cart?${dataParams}`)}`);
      return;
    }

    if (!address.trim()) { toast.error('Please enter a delivery address'); return; }
    if (!city.trim()) { toast.error('Please enter your city'); return; }

    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
    if (!phoneRegex.test(phone)) { toast.error('Please enter a valid phone number'); return; }
    if (cart.length === 0) { toast.error('Your cart is empty'); return; }

    setLoading(true);
    try {
      const shippingAddress = { address: address.trim(), city: city.trim(), phone: phone.trim() };
      const items = cart.map(item => ({
        productId: item.productId,
        color: item.selectedColor,
        size: item.selectedSize,
        quantity: item.quantity,
        usePoints: item.usePoints,
      }));

      // --- STRIPE FLOW: any money items in cart ---
      if (totalAmount > 0) {
        // 1. Create a pending order first
        const orderRes = await api.post('/orders', {
          items,
          paymentMethod: 'stripe',
          shippingAddress,
        });
        const orderId = orderRes.data._id;

        const sessionRes = await api.post('/stripe/create-checkout-session', {
          orderId,
        });

        // 3. Update the order with the stripe session id
        await api.post('/orders', {
          items,
          paymentMethod: 'stripe',
          shippingAddress,
          stripeSessionId: sessionRes.data.sessionId,
        }).catch(() => {}); // best-effort — order already created

        // 4. Redirect to Stripe Hosted Checkout
        clearCart();
        window.location.href = sessionRes.data.url;
        return;
      }

      // --- POINTS-ONLY FLOW ---
      await api.post('/orders', { items, paymentMethod: 'points', shippingAddress });
      toast.success('Order placed successfully!');
      clearCart();
      await refreshUser();
      router.push('/orders');
    } catch (error: any) {
      const serverMessage = error.response?.data?.message;
      if (Array.isArray(serverMessage)) toast.error(serverMessage[0]);
      else if (serverMessage) toast.error(serverMessage);
      else toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-4xl font-black uppercase italic mb-2 tracking-tighter">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-xs text-center font-medium text-lg">Looks like you haven't added any gear to your collection yet.</p>
          <Link href="/">
            <Button className="bg-black hover:bg-gray-800 rounded-2xl px-12 h-14 font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
              Start Shopping
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">My Cart</h1>
            <div className="h-2 w-32 bg-black" />
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Cart Items */}
            <div className="flex-1 space-y-6">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.selectedColor || ''}-${item.selectedSize || ''}`} className="group relative bg-white p-6 rounded-[2.5rem] border-2 border-gray-50 hover:border-black transition-all duration-300 shadow-sm hover:shadow-xl">
                  <div className="flex gap-6 items-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight truncate pr-4">{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedColor, item.selectedSize)}
                          className="text-gray-300 hover:text-red-500 p-2 rounded-xl transition-all hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mb-4 flex gap-2">
                        {item.selectedColor && (
                          <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[9px] border border-gray-100 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.selectedColor.toLowerCase() }} />
                            {item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="bg-zinc-900 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest text-[9px]">
                            SZ: {item.selectedSize}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                        <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100 ring-1 ring-black/5">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedColor, item.selectedSize)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-black text-lg w-10 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedColor, item.selectedSize)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          {item.usePoints ? (
                            <div className="flex flex-col items-end">
                              <span className="text-2xl font-black text-blue-600 tracking-tighter">{item.pointsPrice * item.quantity} LP</span>
                              <span className="text-[10px] font-black uppercase text-blue-400">Paid with Loyalty</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="text-2xl font-black tracking-tighter">${(item.price * item.quantity).toFixed(2)}</span>
                              <span className="text-[10px] font-black uppercase text-green-600 font-bold">Earns {item.pointsReward * item.quantity} LP</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.purchaseType !== 'money' && (
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wallet className={`w-4 h-4 ${item.usePoints ? 'text-blue-600' : 'text-gray-300'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.usePoints ? 'text-blue-600' : 'text-gray-400'}`}>
                              {item.usePoints ? 'Point payment active' : 'Pay with points?'}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              if (user && (user.points ?? 0) < item.pointsPrice * item.quantity && !item.usePoints) {
                                toast.error(`Not enough points! You need ${item.pointsPrice * item.quantity} LP`);
                                return;
                              }
                              toggleUsePoints(item.productId, item.selectedColor, item.selectedSize);
                            }}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 outline-none ${item.usePoints ? 'bg-blue-600' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${item.usePoints ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & Checkout */}
            <div className="lg:w-[450px]">
              <div className="bg-black text-white p-8 rounded-[3rem] shadow-2xl sticky top-24 overflow-hidden border border-white/5">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                <h2 className="text-3xl font-black uppercase italic mb-8 tracking-tighter">Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <span>Subtotal</span>
                    <span className="text-white text-lg font-black">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <span>Points to Redeem</span>
                    <span className="text-blue-400 text-lg font-black">{totalPointsRequired} LP</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <span>Points Earned</span>
                    <span className="text-green-400 text-lg font-black font-black">+{totalPointsToEarn} LP</span>
                  </div>
                  <div className="h-px bg-white/10 my-6" />
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-black uppercase italic">Total Due</span>
                    <div className="text-right">
                      <p className="text-4xl font-black tracking-tighter leading-none">${totalAmount.toFixed(2)}</p>
                      {totalPointsRequired > 0 && (
                        <p className="text-sm font-bold text-blue-400 mt-1 uppercase tracking-widest">+ {totalPointsRequired} LP</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Shipping Information</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full Delivery Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-white/20 outline-none font-bold placeholder:text-gray-600 transition-all focus:bg-white/10"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-white/20 outline-none font-bold placeholder:text-gray-600 transition-all focus:bg-white/10"
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-white/20 outline-none font-bold placeholder:text-gray-600 transition-all focus:bg-white/10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-white text-black hover:bg-gray-100 rounded-2xl h-16 text-xl font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-white/5"
                  >
                    {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                      <span className="flex items-center gap-3">
                        Confirm Order
                        <ArrowRight className="w-6 h-6" />
                      </span>
                    )}
                  </Button>
                  <div className="flex items-center justify-center gap-3 opacity-30">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Stripe Checkout</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-black opacity-20" />
        </div>
    }>
      <CartPageContent />
    </Suspense>
  )
}
