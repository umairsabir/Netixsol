import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Film, Users, Tag, LogOut, Menu, X, Play, Grid2X2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/movies', label: 'Movies', icon: Film },
  { to: '/admin/categories', label: 'Categories', icon: Grid2X2 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/plans', label: 'Plans', icon: Tag },
];

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border-darker">
        <Play fill="currentColor" className="text-primary w-7 h-7" />
        <span className="text-text-p font-bold text-[18px]">StreamVibe</span>
        <span className="text-primary text-[11px] font-semibold bg-primary/10 px-2 py-0.5 rounded-[4px] ml-1">ADMIN</span>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-[8px] text-[14px] font-medium transition-colors ${
                isActive ? 'bg-primary/15 text-primary' : 'text-text-s hover:text-text-p hover:bg-surface'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-border-darker">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-primary text-[12px] font-bold">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-p text-[13px] font-medium truncate">{user?.name}</p>
            <p className="text-text-s text-[11px] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-text-s hover:text-primary hover:bg-primary/10 rounded-[8px] transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-bg-custom flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] bg-bg-darker border-r border-border-darker flex-shrink-0 fixed top-0 left-0 h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[240px] bg-bg-darker border-r border-border-darker flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-[240px] flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-border-darker px-6 flex items-center justify-between bg-bg-custom sticky top-0 z-10">
          <button
            className="lg:hidden text-text-s hover:text-text-p"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="text-text-s text-[13px]">
            Welcome back, <span className="text-text-p font-medium">{user?.name}</span>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
