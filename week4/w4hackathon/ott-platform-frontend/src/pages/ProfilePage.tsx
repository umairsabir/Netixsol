import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, CreditCard, Calendar, LogOut, Shield, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';

const ProfilePage: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: subData } = useQuery({
    queryKey: ['mySubscription'],
    queryFn: async () => {
      const { data } = await api.get('/subscriptions/me');
      return data;
    },
    enabled: !isAdmin, // No need to fetch subscription for admins
  });

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const subscription = subData?.subscription;
  const freeTrial = subData?.freeTrial;
  const isTrialActive = freeTrial && new Date(freeTrial.endDate) > new Date();
  const isSubActive = subscription?.isActive && new Date(subscription.endDate) > new Date();

  return (
    <div className="min-h-screen bg-bg-custom px-[15px] laptop:px-[80px] desktop:px-[162px] py-[80px]">
      <div className="max-w-[900px] mx-auto flex flex-col gap-6">
        <h1 className="text-text-p text-[32px] font-bold">My Account</h1>

        {/* Profile Card */}
        <div className="bg-surface border border-border-darker rounded-[12px] p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-text-p text-[20px] font-bold">{user?.name}</p>
            <p className="text-text-s text-[14px]">{user?.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 bg-primary/20 text-primary text-[12px] font-medium px-2 py-1 rounded-[4px] mt-2 border border-primary/30">
                <Shield size={12} />Administrator
              </span>
            )}
          </div>
        </div>

        {/* Admin Dashboard Card (Admin only) */}
        {isAdmin && (
          <Link 
            to="/admin" 
            className="bg-surface border border-primary/30 rounded-[12px] p-8 flex items-center justify-between hover:bg-primary/5 transition-colors group"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <LayoutDashboard size={32} />
              </div>
              <div>
                <h2 className="text-text-p text-[20px] font-bold">Admin Management Console</h2>
                <p className="text-text-s text-[14px] mt-1">Manage movies, users, and subscription plans from here.</p>
              </div>
            </div>
            <ArrowRight className="text-primary group-hover:translate-x-2 transition-transform" size={28} />
          </Link>
        )}

        {/* Subscription Card (User only) */}
        {!isAdmin && (
          <div className="bg-surface border border-border-darker rounded-[12px] p-6">
            <h2 className="text-text-p text-[18px] font-semibold mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              Subscription
            </h2>
            {isSubActive ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-s text-[14px]">Plan</span>
                  <span className="text-text-p text-[14px] font-semibold capitalize">
                    {(subscription as any)?.planId?.name || 'Active Plan'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-s text-[14px]">Status</span>
                  <span className="text-green-400 text-[14px] font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-s text-[14px]">Expires</span>
                  <span className="text-text-p text-[14px]">
                    {new Date(subscription.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ) : isTrialActive ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-s text-[14px]">Trial Status</span>
                  <span className="text-yellow-400 text-[14px] font-semibold">Free Trial Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-s text-[14px]">Expires</span>
                  <span className="text-text-p text-[14px]">
                    {new Date(freeTrial.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/plans')}
                  className="mt-2 bg-primary text-text-p text-[14px] font-semibold px-4 py-2 rounded-[8px] hover:bg-red-700 transition-colors w-fit"
                >
                  Upgrade to Full Plan
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-text-s text-[14px]">You don't have an active subscription.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/plans')}
                    className="bg-primary text-text-p text-[14px] font-semibold px-4 py-2 rounded-[8px] hover:bg-red-700 transition-colors"
                  >
                    View Plans
                  </button>
                  {!freeTrial && (
                    <button
                      onClick={async () => {
                        await api.post('/free-trial/activate');
                        window.location.reload();
                      }}
                      className="bg-surface border border-border-darker text-text-p text-[14px] font-semibold px-4 py-2 rounded-[8px] hover:border-primary transition-colors"
                    >
                      Start Free Trial
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Account Actions */}
        <div className="bg-surface border border-border-darker rounded-[12px] p-6">
          <h2 className="text-text-p text-[18px] font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            Account Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {!isAdmin && (
              <button
                onClick={() => navigate('/plans')}
                className="bg-surface border border-border-darker text-text-p text-[14px] font-medium px-4 py-2 rounded-[8px] hover:border-primary transition-colors"
              >
                Manage Subscription
              </button>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 bg-surface border border-red-800 text-primary text-[14px] font-medium px-4 py-2 rounded-[8px] hover:bg-red-900/20 transition-colors disabled:opacity-60"
            >
              <LogOut size={16} />
              {loggingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
