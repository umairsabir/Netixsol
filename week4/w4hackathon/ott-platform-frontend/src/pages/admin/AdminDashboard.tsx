import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Film, Users, Play, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data;
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const statCards = [
    { label: 'Total Movies', value: stats?.totalMovies || 0, icon: Film, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Published', value: stats?.publishedMovies || 0, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Blocked Users', value: stats?.blockedUsers || 0, icon: AlertCircle, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-text-p text-[28px] font-bold">Dashboard Overview</h1>
        <p className="text-text-s text-[14px] mt-1">Real-time statistics for your OTT platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-surface border border-border-darker rounded-[12px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-[8px] ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <TrendingUp size={18} className="text-green-500" />
            </div>
            <p className="text-text-s text-[14px] font-medium">{stat.label}</p>
            <p className="text-text-p text-[32px] font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
        <div className="bg-surface border border-border-darker rounded-[12px] p-6 h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
             <Play size={32} className="text-primary translate-x-1" fill="currentColor" />
          </div>
          <h3 className="text-text-p text-[18px] font-semibold">Ready to upload?</h3>
          <p className="text-text-s text-[14px] max-w-[300px] mt-2">Add new movies or shows to the library and publish them to users.</p>
          <button className="mt-6 bg-primary text-text-p font-semibold px-6 py-2.5 rounded-[8px] hover:bg-red-700 transition-colors">
            Upload New Content
          </button>
        </div>
        
        <div className="bg-surface border border-border-darker rounded-[12px] p-6">
          <h3 className="text-text-p text-[18px] font-semibold mb-6">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-border-darker last:border-0">
                <div className="w-10 h-10 bg-bg-custom rounded-full flex items-center justify-center text-text-s">
                  <Film size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-text-p text-[14px] font-medium">New movie metadata updated</p>
                  <p className="text-text-s text-[12px]">2 hours ago • Action</p>
                </div>
                <span className="text-[11px] font-semibold bg-green-500/10 text-green-400 px-2 py-0.5 rounded">Success</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
