'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, Bell, ChevronDown } from 'lucide-react';
import { AdminDropdown, NotificationsModal, ChangePasswordModal } from './components';
import { useAuth } from '@/components/AuthProvider';
import { useNotifications } from '@/components/NotificationProvider';
import api from '@/lib/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  const { user, isLoading, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        router.push('/admin/login');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const [catsRes, productsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products', { params: { limit: 1000 } })
        ]);

        if (!Array.isArray(catsRes.data)) {
          throw new Error('Categories API did not return an array');
        }

        const products = productsRes.data.products || [];
        const catsWithCounts = catsRes.data.map((cat: any) => {
          const count = products.filter((p: any) => {
            const pCatId = typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId;
            return pCatId === cat._id;
          }).length;
          return { ...cat, count };
        });

        setCategories(catsWithCounts);
      } catch (error: any) {
        console.error('DIAGNOSTIC: Category fetch failed', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
      }
    };

    if (user && user.role) {
      fetchCategoryCounts();
    }
  }, [user]);

  if (isLoading || !user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const menuItems = [
    {
      label: 'DASHBOARD', href: '/admin', icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.666992 8.5H4.66699C4.69835 8.50003 4.72135 8.50411 4.74023 8.51172L4.78906 8.5459C4.81771 8.57508 4.83301 8.60476 4.83301 8.66699V11.333C4.83301 11.3962 4.81707 11.4251 4.78809 11.4541C4.75836 11.4838 4.72947 11.4999 4.66699 11.5H0.666992C0.604303 11.5 0.575004 11.4843 0.545898 11.4551L0.544922 11.4541L0.511719 11.4062C0.5041 11.3876 0.5 11.3644 0.5 11.333V8.66699C0.5 8.60429 0.516115 8.57471 0.545898 8.54492C0.574826 8.51604 0.603867 8.5 0.666992 8.5ZM7.33301 5.83301H11.333C11.396 5.83301 11.4252 5.84915 11.4541 5.87793C11.4839 5.90771 11.5 5.93729 11.5 6V11.333C11.5 11.3957 11.4843 11.425 11.4551 11.4541L11.4541 11.4551C11.425 11.4843 11.3957 11.5 11.333 11.5H7.33301C7.27057 11.4999 7.24193 11.4842 7.21289 11.4551L7.21191 11.4541L7.17773 11.4062C7.17018 11.3876 7.16699 11.3643 7.16699 11.333V6C7.16699 5.9373 7.18214 5.90771 7.21191 5.87793C7.24084 5.849 7.27 5.83306 7.33301 5.83301ZM0.833008 11.167H4.5V8.83301H0.833008V11.167ZM7.5 11.167H11.167V6.16699H7.5V11.167ZM0.666992 0.5H4.66699C4.69835 0.500027 4.72135 0.504111 4.74023 0.511719L4.78906 0.545898C4.81771 0.575081 4.83301 0.60476 4.83301 0.666992V6C4.83301 6.06324 4.81707 6.09211 4.78809 6.12109C4.75841 6.15072 4.72936 6.16694 4.66699 6.16699H0.666992C0.604329 6.16699 0.574991 6.15125 0.545898 6.12207L0.544922 6.12012C0.515843 6.09108 0.5 6.06255 0.5 6V0.666992C0.5 0.604285 0.516115 0.574705 0.545898 0.544922C0.574826 0.51604 0.603867 0.5 0.666992 0.5ZM0.833008 5.83301H4.5V0.833008H0.833008V5.83301ZM7.33301 0.5H11.333C11.3961 0.5 11.4252 0.51604 11.4541 0.544922C11.4839 0.574705 11.5 0.604285 11.5 0.666992V3.33301C11.5 3.3957 11.4843 3.425 11.4551 3.4541L11.4541 3.45508C11.425 3.48428 11.3957 3.5 11.333 3.5H7.33301C7.27057 3.49995 7.24193 3.48421 7.21289 3.45508L7.21191 3.4541L7.17773 3.40625C7.17018 3.38762 7.16699 3.3643 7.16699 3.33301V0.666992C7.16699 0.604405 7.18224 0.574647 7.21191 0.544922C7.24084 0.515992 7.27 0.500055 7.33301 0.5ZM7.5 3.16699H11.167V0.833008H7.5V3.16699Z" fill="black" stroke="#151514" />
      </svg>
    },
    {
      label: 'ALL PRODUCTS', href: '/admin/products', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.0978 5.5H2.90219C2.40392 5.5 2 5.90392 2 6.40219V12.5978C2 13.0961 2.40392 13.5 2.90219 13.5H13.0978C13.5961 13.5 14 13.0961 14 12.5978V6.40219C14 5.90392 13.5961 5.5 13.0978 5.5Z" stroke="#232321" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4.5 2.5H11.5ZM3.5 4H12.5Z" fill="#232321" />
        <path d="M4.5 2.5H11.5M3.5 4H12.5" stroke="#232321" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
      </svg>
    },
    {
      label: 'CATEGORIES', href: '/admin/categories', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.33333 1.33301H12.6667V12.6663H1.33333V1.33301Z" stroke="#232321" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M1.33333 4.66699H12.6667M4.66667 1.33301V12.6663" stroke="#232321" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    },
    {
      label: 'ORDER LIST', href: '/admin/orders', icon: <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 0.0234375H4.875C4.90194 0.0234375 4.92822 0.0336878 4.94727 0.0527344C4.96631 0.071781 4.97656 0.0980639 4.97656 0.125V4.5C4.97656 4.90404 5.13715 5.29145 5.42285 5.57715C5.70855 5.86285 6.09596 6.02344 6.5 6.02344H10.875C10.9019 6.02344 10.9282 6.03369 10.9473 6.05273C10.9663 6.07178 10.9766 6.09806 10.9766 6.125V12C10.9766 12.5242 10.7681 13.0268 10.3975 13.3975C10.0268 13.7681 9.52422 13.9766 9 13.9766H2C1.47578 13.9766 0.973216 13.7681 0.602539 13.3975C0.231862 13.0268 0.0234375 12.5242 0.0234375 12V2C0.0234375 1.47578 0.231862 0.973216 0.602539 0.602539C0.973216 0.231862 1.47578 0.0234375 2 0.0234375ZM3 9.97656C2.86118 9.97656 2.72805 10.0317 2.62988 10.1299C2.53172 10.228 2.47656 10.3612 2.47656 10.5C2.47656 10.6388 2.53172 10.772 2.62988 10.8701C2.72805 10.9683 2.86118 11.0234 3 11.0234H8C8.13882 11.0234 8.27195 10.9683 8.37012 10.8701C8.46828 10.772 8.52344 10.6388 8.52344 10.5C8.52344 10.3612 8.46828 10.228 8.37012 10.1299C8.27195 10.0317 8.13882 9.97656 8 9.97656H3ZM3 7.47656C2.86118 7.47656 2.72805 7.53172 2.62988 7.62988C2.53172 7.72805 2.47656 7.86118 2.47656 8C2.47656 8.13882 2.53172 8.27195 2.62988 8.37012C2.72805 8.46828 2.86118 8.52344 3 8.52344H8C8.13882 8.52344 8.27195 8.46828 8.37012 8.37012C8.46828 8.27195 8.52344 8.13882 8.52344 8C8.52344 7.86118 8.46828 7.72805 8.37012 7.62988C8.27195 7.53172 8.13882 7.47656 8 7.47656H3Z" fill="#232321" stroke="#232321" strokeWidth="0.046875" />
      </svg>
    },
    { label: 'SALE ENGINE', href: '/admin/sales', icon: '⚡' },
    ...(user?.role === 'super_admin' ? [{ label: 'USERS', href: '/admin/users', icon: '👥' }] : []),
  ];


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-58' : 'w-20'
          } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="text-2xl font-bold text-blue-600">
            <svg width="175" height="49" viewBox="0 0 175 49" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M112.875 48.4688L130.313 27.2812C131.532 25.7812 132.282 24.2812 136.125 24.2812C141.469 24.2812 148.407 23.0625 154.219 21.75C162.282 19.9688 169.032 16.5938 174.375 13.9688C172.875 16.875 162.657 19.875 157.5 22.5938C162 21.4688 162.844 21.1875 167.25 19.6875C163.969 22.6875 160.125 22.4062 154.782 25.0312C158.719 24.1875 158.907 24.1875 162.75 22.9688C160.407 25.5 155.907 25.125 152.438 27.0938C156 26.5312 155.719 26.7188 159 25.7812C156.657 27.2812 152.719 29.7188 145.407 32.7188L131.532 35.9062C130.5 36.0938 127.969 36.375 125.813 38.4375C123.094 41.1562 119.344 44.3438 118.219 45.0938C116.907 46.125 115.407 47.9062 112.875 48.4688ZM111.75 47.625L127.594 27.1875C128.813 25.5938 129.094 23.5312 126 22.4062C121.782 20.8125 117.188 20.4375 113.063 18.75C104.532 15.4688 99.5629 7.59375 94.5004 0C92.8129 3.28125 99.1879 7.40625 100.688 11.625C98.2504 9.1875 96.0004 6.65625 94.0317 3.84375C93.7504 7.6875 99.3754 10.125 101.063 14.3438C98.7192 12.2812 96.4692 10.2188 94.5942 7.96875C93.9379 11.1562 100.594 14.1562 101.438 17.0625C99.1879 15.5625 97.0317 13.875 95.4379 12C95.8129 14.1562 98.0629 17.1562 102.657 20.8125C107.063 24.9375 114.282 30.0938 114.469 37.125C114.469 39.2812 113.532 40.9688 112.5 42.8438C111.844 44.0625 111.375 45.75 111.75 47.625Z" fill="#949599" />
              <path fillRule="evenodd" clipRule="evenodd" d="M0 47.8125H5.8125L10.4062 38.1562H21.6562L23.5312 47.8125H32.9062L24.375 13.3125H18.2812L0 47.8125ZM12 34.875L18.1875 23.0625L20.9062 34.875H12ZM41.4375 23.0625H49.3125L48.75 28.4062C51.0938 24.2812 53.5312 22.4062 56.1562 23.0625L55.125 30.9375C51.5625 29.4375 49.125 30.5625 48.0938 34.4062L46.5938 47.8125H38.25L41.4375 23.0625ZM62.3438 23.0625H69.9375L66.375 47.8125H58.7812L62.3438 23.0625ZM78.5625 15.5625H85.875L83.3438 33.6562H85.2188L94.3125 23.0625H101.625L91.5 33.6562L98.625 47.8125H88.875L84.75 37.0312H82.7812L81.2812 47.8125H73.875L78.5625 15.5625Z" fill="#0D3F84" />
            </svg>

          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Categories */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center justify-between w-full mb-3 hover:text-blue-600 transition-colors"
            >
              <h3 className="font-semibold text-gray-700">Categories</h3>
              <ChevronDown className={`w-4 h-4 transition-transform ${categoriesOpen ? '' : '-rotate-90'}`} />
            </button>
            {categoriesOpen && (
              <div className="space-y-1 mt-2 max-h-[300px] overflow-y-auto no-scrollbar">
                {categories.map((cat, i) => (
                  <Link
                    key={i}
                    href={`/admin/products?categoryId=${cat._id}`}
                    className="flex items-center justify-between text-[13px] text-gray-500 hover:text-blue-600 py-1.5 px-2 hover:bg-blue-50/50 rounded-lg transition-all group"
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-black tracking-tighter transition-colors">
                      {cat.count}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          © 2023 - pulstron Dashboard
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent ml-2 outline-none text-sm"
              />
            </div>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm font-semibold">{user.name || 'ADMIN'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <AdminDropdown
                isOpen={adminDropdownOpen}
                onClose={() => setAdminDropdownOpen(false)}
                onLogout={logout}
                onChangePassword={() => {
                  setAdminDropdownOpen(false);
                  setChangePasswordOpen(true);
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>

        <ChangePasswordModal
          isOpen={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
        />

        {/* Notifications Modal */}
        <NotificationsModal isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between text-sm text-gray-600">
          <div>© 2023 - pulstron Dashboard</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-900">About</a>
            <a href="#" className="hover:text-gray-900">Careers</a>
            <a href="#" className="hover:text-gray-900">Policy</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
