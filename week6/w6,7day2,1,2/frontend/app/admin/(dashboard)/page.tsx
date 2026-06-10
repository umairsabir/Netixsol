'use client';

import { useState, useEffect } from 'react';
import { StatCard, Table, StatusBadge, ProductsModal } from './components';
import { MoreVertical, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function Dashboard() {
  const [timeRange] = useState('monthly');
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/orders/stats/dashboard'),
          api.get('/orders', { params: { limit: 6 } })
        ]);
        setStats(statsRes.data);
        setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.orders || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest">Gathering intelligence...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, change: '+12.5%', icon: '💰' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), change: '+5.2%', icon: '📦' },
    { label: 'Pending Orders', value: stats.pendingOrders.toString(), change: '-2.1%', icon: '🔄' },
    { label: 'Completed Orders', value: stats.completedOrders.toString(), change: '+8.4%', icon: '✅' },
  ];

  const chartData = stats.monthlyStats.length > 0 ? stats.monthlyStats : [
    { month: 'N/A', value: 0 }
  ];

  const maxValue = Math.max(...chartData.map((d: any) => d.value), 1);

  const formattedOrders = recentOrders.map((order: any) => [
    <div key={order._id} className="flex items-center gap-2">
       <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[10px]">📦</div>
       <span className="font-bold truncate max-w-[120px]">{order.items[0]?.name || 'N/A'}</span>
    </div>,
    <span className="font-black text-[10px] text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>,
    new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    <div className="flex items-center gap-1.5 font-bold">
      <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[8px]">👤</div>
      {order.userId?.name || 'Guest'}
    </div>,
    <StatusBadge key={order._id} status={order.status.charAt(0).toUpperCase() + order.status.slice(1)} />,
    <span className="font-black">${order.totalAmount.toLocaleString()}</span>
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1 uppercase tracking-tighter italic">Dashboard</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Management &gt; Intelligence Overview</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest">System Operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="text-left"
          >
            <StatCard
              label={stat.label}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
            />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sale Graph */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
               <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Revenue Flow</h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Transaction value over time</p>
            </div>
            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
              {['WEEKLY', 'MONTHLY', 'YEARLY'].map((period) => (
                <button
                  key={period}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${timeRange === period.toLowerCase()
                      ? 'bg-black text-white shadow-lg'
                      : 'text-gray-400 hover:text-black'
                    }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-72 flex items-end justify-around gap-4 p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
            {chartData.map((data: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="flex flex-col items-center w-full">
                  <div className="text-[8px] font-black text-gray-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${Math.ceil(data.value).toLocaleString()}
                  </div>
                  <div
                    className="w-full max-w-[40px] bg-black rounded-t-xl transition-all group-hover:bg-blue-600 shadow-lg shadow-black/5"
                    style={{ height: `${(data.value / maxValue) * 180}px`, minHeight: '4px' }}
                  />
                </div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  {data.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
               <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Velocity</h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Top performing assets</p>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-xl">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            {stats.bestSellers.length === 0 ? (
               <div className="py-12 text-center text-gray-300 italic text-xs">No sales data recorded yet</div>
            ) : (
              stats.bestSellers.map((seller: any, i: number) => (
                <div key={i} className="group p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-inner border border-gray-100 flex items-center justify-center text-xl">
                       {i === 0 ? '🏆' : i === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm uppercase tracking-tight truncate">{seller.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">${seller.totalRevenue.toLocaleString()} volume</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pl-16">
                    <span className="font-black text-xs">${seller.price.toLocaleString()}</span>
                    <span className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{seller.totalSales} SOLD</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="w-full mt-8 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-800 transition-all shadow-xl shadow-black/10">
            GENERATE FULL REPORT
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
             <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Live Feed</h2>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Incoming order stream</p>
          </div>
          <button className="p-2 hover:bg-gray-50 rounded-xl">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <Table
          headers={['Activity', 'ID', 'Timestamp', 'Operator', 'Status', 'Volume']}
          rows={formattedOrders}
        />
        {recentOrders.length === 0 && (
           <div className="py-20 text-center text-gray-300 italic text-xs">Awaiting first deployment...</div>
        )}
      </div>

      {/* Products Modal */}
      <ProductsModal isOpen={productsModalOpen} onClose={() => setProductsModalOpen(false)} />
    </div>
  );
}
