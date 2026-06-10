'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, Bell, BellOff, Tag, Clock, X, Truck } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import { useNotifications } from './NotificationProvider';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { notifications, unreadCount, markAllRead } = useNotifications();

  const [search, setSearch] = useState('');
  const [showPromo, setShowPromo] = useState(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim();
    if (!query) return;

    // Navigate to shop with search param
    router.push(`/shop?search=${encodeURIComponent(query)}`);
    setSearch('');
    setIsMobileSearchOpen(false);
  };

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'On Sale', href: '/shop?onSale=true' },
    { name: 'New Arrivals', href: '/shop?sort=newest' },
    { name: 'Brands', href: '/shop' },
  ];

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="sticky top-0 left-0 right-0 z-50">
      {/* Promotional Banner */}
      {showPromo && (
        <div className="bg-black text-white py-2 px-4 text-center text-sm flex items-center justify-between">
          <span className="w-5"></span>
          <span className="text-white text-[10px] md:text-xs font-medium uppercase tracking-widest">Sign up and get 20% off to your first order. <Link href="/register" className="underline font-black hover:text-gray-300">Sign Up Now</Link></span>
          <button className="text-white hover:text-gray-300" onClick={() => setShowPromo(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <nav className="bg-white border-b border-gray-100 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-8">
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 border-r-0">
                <SheetHeader className="p-6 border-b border-gray-50">
                  <SheetTitle className="text-2xl font-integral italic uppercase tracking-tighter text-left">
                    SHOP.CO
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="px-4 py-4 text-sm font-black uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Account</p>
                    {user ? (
                      <>
                        <Link href="/profile" className="px-4 py-3 flex items-center gap-3 font-bold hover:bg-gray-50 rounded-2xl">
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                        <Link href="/orders" className="px-4 py-3 flex items-center gap-3 font-bold hover:bg-gray-50 rounded-2xl">
                          <ShoppingCart className="w-4 h-4" /> My Orders
                        </Link>
                        <button onClick={logout} className="w-full px-4 py-3 flex items-center gap-3 font-bold text-red-500 hover:bg-red-50 rounded-2xl">
                          <X className="w-4 h-4" /> Logout
                        </button>
                      </>
                    ) : (
                      <Link href="/login" className="mx-4 bg-black text-white py-4 rounded-full text-center font-black uppercase tracking-widest text-[10px]">
                        Login
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="text-xl md:text-2xl font-integral italic uppercase tracking-tighter hover:opacity-80 transition-opacity whitespace-nowrap">
              SHOP.CO
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-xs font-black uppercase tracking-widest hover:text-gray-400 transition-colors">{link.name}</Link>
              ))}
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden lg:block text-center">
            <form onSubmit={handleSearch} className="relative inline-block w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-100 rounded-full py-2.5 pl-11 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all lg:hidden"
            >
              <Search className="w-6 h-6" />
            </button>

            <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-xl transition-all relative group">
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white group-hover:scale-110 transition-transform">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <DropdownMenu onOpenChange={(open) => open && markAllRead()}>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-all relative group">
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white group-hover:scale-110 transition-transform">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-2xl border-gray-100">
                <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">Notifications</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
                        <BellOff className="w-6 h-6 opacity-20" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest px-8">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <DropdownMenuItem
                        key={notif._id}
                        className={`p-4 rounded-2xl cursor-pointer focus:bg-gray-50 mb-2 border border-transparent transition-all flex flex-col items-start gap-1 ${!notif.isRead ? 'bg-black/[0.02] border-black/5' : 'opacity-60'}`}
                        onClick={() => notif.link && router.push(notif.link)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className={`p-2 rounded-xl ${notif.type === 'order_placed' ? 'bg-emerald-50 text-emerald-600' :
                              notif.type === 'status_updated' ? 'bg-blue-50 text-blue-600' :
                                'bg-orange-50 text-orange-600'
                            }`}>
                            {notif.type === 'order_placed' ? <ShoppingCart className="w-3.5 h-3.5" /> :
                              notif.type === 'status_updated' ? <Truck className="w-3.5 h-3.5" /> :
                                <Tag className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-black text-[10px] uppercase tracking-tighter block truncate">{notif.title}</span>
                            <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">{notif.message}</p>
                          </div>
                          {!notif.isRead && <div className="w-2 h-2 rounded-full bg-black shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1.5 text-[8px] text-gray-300 font-black mt-2 uppercase tracking-widest pl-10">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-2 hover:bg-gray-100 rounded-xl relative overflow-hidden h-10 w-10">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-gray-100">
                    <div className="px-3 py-3 border-b border-gray-50 mb-1 flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name || 'User'} className="w-10 h-10 rounded-full border border-gray-100 shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-400 truncate mt-1">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 transition-all hover:translate-x-1">
                      <Link href="/profile" className="w-full font-bold text-xs uppercase tracking-widest">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 transition-all hover:translate-x-1">
                      <Link href="/orders" className="w-full font-bold text-xs uppercase tracking-widest">My Orders</Link>
                    </DropdownMenuItem>
                    {(user.role === 'admin' || user.role === 'super_admin') && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 bg-gray-50 mt-1 transition-all hover:translate-x-1">
                        <Link href="/admin" className="w-full font-bold text-xs uppercase tracking-widest">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout} className="rounded-xl cursor-pointer py-3 text-red-600 focus:text-red-700 focus:bg-red-50 font-bold mt-1 text-xs uppercase tracking-widest">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="rounded-full px-6 font-black uppercase tracking-widest text-[10px] bg-black hover:bg-gray-800 h-10 shadow-lg shadow-black/10">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Overlay */}
        {isMobileSearchOpen && (
          <div className="lg:hidden p-4 bg-white border-t border-gray-50 animate-in slide-in-from-top duration-300">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search for products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-100 rounded-full py-3 pl-11 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </form>
          </div>
        )}
      </nav>
    </div>
  );
}
