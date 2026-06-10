import { ChevronUp, MoreVertical, ChevronLeft, ChevronRight, X, Check, BellOff, ShoppingCart, Truck, Tag, Clock } from 'lucide-react';
import { useNotifications } from '@/components/NotificationProvider';
import { useRouter } from 'next/navigation';

// Stat Card Component
export function StatCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600 text-sm font-semibold">{label}</p>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            <ChevronUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 font-semibold">{change}</span>
            <span className="text-xs text-gray-500">Compared to Oct 2023</span>
          </div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

// Product Card Component
export function ProductCard({
  image,
  name,
  category,
  price,
  summary,
  sales,
  remaining,
}: {
  image: string;
  name: string;
  category: string;
  price: string;
  summary: string;
  sales: number;
  remaining: number;
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <img
          src={image}
          alt={name}
          className="w-16 h-16 bg-gray-200 rounded object-cover"
        />
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
      <p className="text-sm text-gray-500 mb-2">{category}</p>
      <p className="text-lg font-bold text-gray-900 mb-3">{price}</p>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{summary}</p>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Sales</span>
          <span className="text-orange-500 font-semibold">{sales}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Remaining Products</span>
          <span className="text-orange-500 font-semibold">{remaining}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full"
            style={{ width: `${Math.random() * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Form Input Component
export function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  rows,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  rows?: number;
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      {rows ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
}

// Button Component
export function Button({
  label,
  onClick,
  variant = 'primary',
  className = '',
}: {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}) {
  const baseClasses = 'px-6 py-2 rounded-lg font-semibold transition-colors';
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800',
    secondary: 'border border-gray-300 text-gray-900 hover:bg-gray-50',
    danger: 'bg-blue-600 text-white hover:bg-blue-700',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {label}
    </button>
  );
}

// Status Badge Component
export function StatusBadge({ status }: { status: 'Delivered' | 'Canceled' | 'Pending' | 'Processing' }) {
  const styles = {
    Delivered: 'bg-green-100 text-green-700',
    Canceled: 'bg-orange-100 text-orange-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Processing: 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 w-fit ${styles[status]}`}>
      <span className={`w-2 h-2 rounded-full ${status === 'Delivered' ? 'bg-green-700' :
          status === 'Canceled' ? 'bg-orange-700' :
            status === 'Pending' ? 'bg-yellow-700' :
              'bg-blue-700'
        }`} />
      {status}
    </span>
  );
}

// Table Component
export function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="px-6 py-4 text-sm text-gray-900">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Pagination Component
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 10); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded font-semibold transition-colors ${currentPage === page
              ? 'bg-gray-900 text-white'
              : 'border border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
        >
          {page}
        </button>
      ))}

      {totalPages > 10 && (
        <>
          <span className="text-gray-500">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-8 h-8 rounded border border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Image Upload Component
export function ImageUpload({
  onUpload,
}: {
  onUpload: (file: File) => void;
}) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
      <div className="text-4xl mb-2">🖼️</div>
      <p className="text-gray-900 font-semibold mb-1">
        Drop your imager here, or browse
      </p>
      <p className="text-sm text-gray-500">Jpeg, png are allowed</p>
      <input
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onUpload(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}

// Modal Backdrop Component
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

// Products Modal Component
export function ProductsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const products = [
    { name: 'Lorem Ipsum', price: '₹140', date: 'Nov 15,2023' },
    { name: 'Lorem Ipsum', price: '₹140', date: 'Nov 15,2023' },
    { name: 'Lorem Ipsum', price: '₹140', date: 'Nov 15,2023' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Products">
      <div className="space-y-3">
        {products.map((product, i) => (
          <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-200 last:border-0">
            <div className="w-12 h-12 bg-gray-300 rounded flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{product.name}</p>
              <p className="text-sm text-gray-500">{product.date}</p>
            </div>
          </div>
        ))}
        <button className="w-full mt-4 text-blue-600 font-semibold hover:text-blue-700 py-2">
          See all products
        </button>
      </div>
    </Modal>
  );
}

// Notifications Modal Component
export function NotificationsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { notifications, markAllRead, markRead } = useNotifications();
  const router = useRouter();

  const handleNotificationClick = async (notif: any) => {
    await markRead(notif._id);
    if (notif.link) router.push(notif.link);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {notifications.length === 0 ? (
           <div className="py-12 text-center text-gray-400">
              <BellOff className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No notifications yet</p>
           </div>
        ) : (
          notifications.map((notif: any) => (
            <div 
              key={notif._id} 
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${!notif.isRead ? 'bg-blue-50/50 border-blue-100/50 hover:bg-blue-50' : 'bg-white border-transparent hover:bg-gray-50'}`}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                notif.type === 'order_placed' ? 'bg-emerald-100 text-emerald-600' :
                notif.type === 'status_updated' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-500'
              }`}>
                {notif.type === 'order_placed' ? <ShoppingCart className="w-4 h-4" /> :
                 notif.type === 'status_updated' ? <Truck className="w-4 h-4" /> :
                 <Tag className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="font-bold text-sm text-gray-900 truncate uppercase tracking-tight">{notif.title}</p>
                  {!notif.isRead && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-snug">{notif.message}</p>
                <div className="flex items-center gap-1 mt-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                   <Clock className="w-3 h-3" />
                   {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
        <button 
          onClick={() => markAllRead()}
          className="flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          MARK ALL AS READ
        </button>
      </div>
    </Modal>
  );
}

export function AdminDropdown({
  isOpen,
  onClose,
  onLogout,
  onChangePassword,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onChangePassword: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-14 right-0 bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-50">
      <button
        onClick={onChangePassword}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-900"
      >
        CHANGE PASSWORD
        <ChevronUp className="w-4 h-4 text-gray-400 rotate-180" />
      </button>
      <button
        onClick={onLogout}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-t border-gray-200 flex items-center justify-between font-semibold text-gray-900"
      >
        LOG OUT
        <ChevronUp className="w-4 h-4 text-gray-400 rotate-180" />
      </button>
    </div>
  );
}

import { useAuth } from '@/components/AuthProvider';
import { useState } from 'react';
import api from '@/lib/api';

export function ChangePasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await api.patch('/users/change-password', { oldPassword, newPassword });
      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={handleUpdate} className="space-y-4">
        {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
        {success && <div className="text-green-600 text-sm font-semibold">{success}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mt-4"
        >
          Update Password
        </button>
      </form>
    </Modal>
  );
}

