'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import {
  User,
  Mail,
  Coins,
  Settings,
  Save,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  // Login Activity Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const ITEMS_PER_PAGE = 5;

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  if (!user) return null;

  const handleUpdateProfile = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setIsLoading(true);
    try {
      await api.patch('/users/profile', { name });
      await refreshUser();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivity = (user.loginActivity || [])
    .filter((activity) => {
      if (!dateFilter) return true;
      try {
        const activityDate = new Date(activity.timestamp).toISOString().split('T')[0];
        return activityDate === dateFilter;
      } catch (e) {
        return true;
      }
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalPages = Math.ceil(filteredActivity.length / ITEMS_PER_PAGE) || 1;
  const paginatedActivity = filteredActivity.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Points Card */}
      <div className="bg-white p-8 rounded-[40px] border-2 border-gray-50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
          <Coins className="w-24 h-24" />
        </div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-xs mb-2">Available Loyalty Points</p>
        <div className="flex items-baseline gap-2 mb-6">
          <h3 className="text-5xl font-black text-black">{user.points || 0}</h3>
          <span className="text-sm font-black text-gray-400 uppercase tracking-widest">LP</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div className="bg-black h-full" style={{ width: `${Math.min((user.points || 0) / 10, 100)}%` }} />
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-[40px] border-2 border-gray-50 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
            <div className="w-2 h-8 bg-black rounded-full" />
            Account Details
          </h3>
          <button
            onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
            disabled={isLoading}
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (isEditing ? <Save className="w-3 h-3" /> : <Settings className="w-3 h-3" />)}
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            {isEditing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-black/5 focus:border-black outline-none transition-all font-bold"
              />
            ) : (
              <div className="bg-gray-50/50 p-4 rounded-2xl flex items-center gap-4 text-gray-700 font-bold border-2 border-transparent">
                <User className="w-5 h-5 text-gray-400" />
                {user.name}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="bg-gray-50/50 p-4 rounded-2xl flex items-center gap-4 text-gray-700 font-bold border-2 border-transparent opacity-60">
              <Mail className="w-5 h-5 text-gray-400" />
              {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Login Activity */}
      <div className="bg-white rounded-[40px] border-2 border-gray-50 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
            <div className="w-2 h-8 bg-black rounded-full" />
            Login Activity
          </h3>
          <input
            type="date"
            value={dateFilter}
            max={new Date().toISOString().split('T')[0]}
            onChange={handleDateFilterChange}
            className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 outline-none"
          />
        </div>

        {paginatedActivity.length > 0 ? (
          <div className="space-y-4">
            {paginatedActivity.map((activity, index) => (
              <div key={index} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {activity.method === 'google' ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    ) : activity.method === 'github' ? (
                      <svg className="w-5 h-5 fill-current text-[#24292e]" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    ) : activity.method === 'discord' ? (
                      <svg className="w-5 h-5 fill-current text-[#5865F2]" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 1-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                    ) : (
                      <Mail className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wider">{activity.method} Login</p>
                    <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1">Provider used for authentication</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black tracking-widest">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="text-xs font-black uppercase tracking-widest px-4 py-2 bg-gray-50 rounded-full disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-gray-400">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="text-xs font-black uppercase tracking-widest px-4 py-2 bg-gray-50 rounded-full disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 font-bold text-sm">No recent login activity found.</p>
        )}
      </div>
    </div>
  );
}
