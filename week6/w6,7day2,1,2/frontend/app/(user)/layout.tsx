'use client';

import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { 
  User, 
  Package, 
  ShieldCheck, 
  ChevronRight, 
  LogOut,
  Unlock,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function UserAccountLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const pathname = usePathname();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-20">
          <Loader2 className="w-12 h-12 animate-spin text-black" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Navbar />
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center mt-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Unlock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">My Account</h2>
          <p className="text-gray-500 mb-6 font-medium">Please login to view your profile and manage your orders.</p>
          <Link href="/login">
            <button className="w-full rounded-full bg-black text-white h-12 uppercase font-black tracking-widest text-xs hover:bg-gray-800 transition-colors">
              Login to Account
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'profile', name: 'Overview', icon: User, path: '/profile' },
    { id: 'orders', name: 'My Orders', icon: Package, path: '/orders' },
    { id: 'security', name: 'Security', icon: ShieldCheck, path: '/security' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center text-4xl text-white font-black shadow-lg shadow-black/5">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">{user.name}</h1>
              <div className="flex items-center gap-2 text-gray-400 font-bold text-sm uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {user.role}
              </div>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="rounded-full border-2 border-red-50 text-red-500 hover:bg-red-50 hover:text-red-600 font-black uppercase tracking-widest text-[10px] px-6 h-11 transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-2">
            {menuItems.map((item) => (
              <Link 
                key={item.id} 
                href={item.path} 
                className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all group ${
                  pathname === item.path || (item.id === 'profile' && pathname === '/profile' && !window.location.search)
                    ? 'bg-black text-white shadow-xl shadow-black/10' 
                    : 'text-gray-500 hover:bg-white hover:text-black border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${pathname === item.path ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />
                  <span className="font-black uppercase tracking-widest text-xs">{item.name}</span>
                </div>
                {pathname !== item.path && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40" />}
              </Link>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
