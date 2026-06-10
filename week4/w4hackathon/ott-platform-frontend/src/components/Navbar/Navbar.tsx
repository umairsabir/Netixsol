import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isMenuOpen]);

  return (
    <nav className="h-[80px] md:h-[90px] bg-transparent w-full z-50 relative">
      <div className="grid grid-cols-2 xl:grid-cols-[1fr_auto_1fr] items-center px-[20px] md:px-[40px] laptop:px-[80px] desktop:px-[162px] py-[10px] md:py-[15px] h-full w-full max-w-[1920px] mx-auto">
        {/* Logo Container */}
        <div className="flex justify-start">
          <Link to="/" className="flex items-center cursor-pointer">
            <img
              src="/logo.png"
              alt="StreamVibe Logo"
              className="w-[100px] h-[30px] laptop:w-[140px] laptop:h-[42px] desktop:w-[160px] desktop:h-[48px]"
            />
          </Link>
        </div>

        {/* Navigation Buttons Container (Desktop Only) */}
        <div className="hidden xl:flex justify-center items-center">
          <div className="flex flex-row items-center pt-[6px] pb-[6px] pl-[6px] pr-[6px] gap-[6px] w-auto h-[56px] bg-bg-custom border-[3px] border-border-custom rounded-[10px] flex-shrink-0">
            <Link
              to="/"
              className={`flex items-center justify-center px-[18px] py-[8px] text-[15px] font-medium leading-[150%] transition-all rounded-[8px] ${
                isActive("/") ? "bg-surface text-text-p" : "text-text-s hover:text-text-p"
              }`}
            > Home </Link>
            <Link
              to="/movies"
              className={`flex items-center justify-center px-[18px] py-[8px] text-[15px] font-medium leading-[150%] transition-all rounded-[8px] ${
                isActive("/movies") ? "bg-surface text-text-p" : "text-text-s hover:text-text-p"
              }`}
            > Movies & Shows </Link>
            <Link
              to="/plans"
              className={`flex items-center justify-center px-[18px] py-[8px] text-[15px] font-medium leading-[150%] transition-all rounded-[8px] ${
                isActive("/plans") || isActive("/subscriptions") ? "bg-surface text-text-p" : "text-text-s hover:text-text-p"
              }`}
            > Subscriptions </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center justify-center px-[18px] py-[8px] text-[15px] font-medium leading-[150%] transition-all rounded-[8px] border border-primary/20 text-primary hover:bg-primary/10`}
              >
                <LayoutDashboard size={16} className="mr-2" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* Utilities/Action Icons Container */}
        <div className="flex flex-row items-center justify-end gap-[6px] md:gap-[16px]">
          <button className="text-text-p hover:opacity-70 transition-opacity p-1.5 hidden sm:block">
            <Search size={20} />
          </button>
          <button className="text-text-p hover:opacity-70 transition-opacity p-1.5 hidden sm:block">
            <Bell size={20} />
          </button>
          
          <div className="h-5 w-[1px] bg-border-custom hidden md:block mx-1" />

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link 
                  to="/profile" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-[8px] border transition-all ${isActive('/profile') ? 'bg-surface border-primary' : 'bg-transparent border-border-custom hover:bg-surface'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="text-text-p font-medium hidden lg:block">{user?.name}</span>
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-3 bg-surface border border-border-custom rounded-[8px] text-text-s hover:text-primary transition-colors"
                  title="Logout"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="text-text-p px-4 py-2 font-medium text-[15px] hover:text-primary transition-colors hidden sm:block"
                > Login </Link>
                <Link 
                  to="/register" 
                  className="bg-primary text-text-p px-4 py-2 rounded-[6px] font-medium text-[15px] hover:bg-red-700 transition-colors"
                > Sign Up </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button 
            className="xl:hidden p-3 bg-surface border border-border-custom rounded-[8px] text-text-p hover:bg-border-custom transition-colors"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar / Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Content */}
          <div className="absolute top-0 right-0 h-full w-[280px] sm:w-[350px] bg-bg-custom p-6 shadow-2xl flex flex-col border-l border-border-custom animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-10">
               <img src="/logo.png" alt="Logo" className="w-[116px] h-[35px]" />
               <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-text-s hover:text-text-p transition-colors"
               >
                 <X size={28} />
               </button>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`px-5 py-4 rounded-[10px] text-[18px] font-medium transition-all ${
                  isActive("/") ? "bg-surface text-text-p border border-border-custom" : "text-text-s hover:bg-surface/50"
                }`}
              > Home </Link>
              <Link
                to="/movies"
                onClick={() => setIsMenuOpen(false)}
                className={`px-5 py-4 rounded-[10px] text-[18px] font-medium transition-all ${
                  isActive("/movies") ? "bg-surface text-text-p border border-border-custom" : "text-text-s hover:bg-surface/50"
                }`}
              > Movies & Shows </Link>
              <Link
                to="/plans"
                onClick={() => setIsMenuOpen(false)}
                className={`px-5 py-4 rounded-[10px] text-[18px] font-medium transition-all ${
                  isActive("/plans") || isActive("/subscriptions") ? "bg-surface text-text-p border border-border-custom" : "text-text-s hover:bg-surface/50"
                }`}
              > Subscriptions </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-5 py-4 rounded-[10px] text-[18px] font-medium text-primary hover:bg-primary/5 flex items-center gap-3 mt-4 border border-primary/20"
                >
                  <LayoutDashboard size={20} />
                  Admin Panel
                </Link>
              )}
            </div>

            <div className="mt-auto pt-8 border-t border-border-custom flex flex-col gap-4">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-4 text-center text-text-p font-semibold border border-border-custom rounded-[10px] hover:bg-surface transition-colors"
                  > Login </Link>
                  <Link 
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-4 text-center bg-primary text-text-p font-semibold rounded-[10px] hover:bg-red-700 transition-colors"
                  > Sign Up </Link>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link 
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-4 bg-surface rounded-[12px] border border-border-custom"
                  >
                     <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[20px] font-bold border border-primary/30">
                        {user?.name?.[0]}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-text-p font-bold">{user?.name}</span>
                        <span className="text-text-xs opacity-60">View Profile</span>
                     </div>
                  </Link>
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-bg-custom border border-border-darker text-text-s hover:text-primary hover:border-primary/30 rounded-[10px] transition-all"
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
