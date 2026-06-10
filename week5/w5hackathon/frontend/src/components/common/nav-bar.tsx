"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Star, ChevronDown, Menu, X, Car, User, LogOut, Hammer, Bell } from "lucide-react";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import NotificationDropdown from "./notification-dropdown";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Car Auction", href: "/auction" },
    { label: "Sell Your Car", href: "/car/sell" },
    { label: "About us", href: "/about" },
    { label: "Contact", href: "/contact" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isHomePage = pathname === "/";
    const isTransparent = isHomePage;

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login");
    };

    return (
        <nav className={`${isTransparent ? "bg-transparent absolute top-10 left-0 right-0" : "bg-[#e8edfa] relative"} w-full z-50 transition-all duration-300`}>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[118px] h-[82px] flex items-center justify-between gap-6">
                {/* Logo */}
                <a href="/" className="flex items-center gap-2 shrink-0">
                    <Image src="/logo.png" alt="Logo" width={165} height={55} style={{ height: "auto" }} />
                </a>

                {/* Desktop links */}
                <ul className="hidden md:flex items-center gap-8 list-none">
                    {navLinks.map((link) => {
                        const isSomeOtherLinkActive = navLinks.some(l => l.href !== "/" && (pathname === l.href || pathname.startsWith(l.href + "/")));
                        const active = link.href === "/" 
                            ? (pathname === "/" || !isSomeOtherLinkActive)
                            : (pathname === link.href || pathname.startsWith(link.href + "/"));
                        return (
                            <li key={link.label} className="flex flex-col items-center">
                                <a
                                    href={link.href}
                                    className={`text-base whitespace-nowrap ${active
                                        ? `font-bold ${isTransparent ? "text-white" : "text-[#2e3d83]"}`
                                        : `${isTransparent ? "text-gray-200" : "text-[#545677]"} hover:${isTransparent ? "text-white" : "text-[#2e3d83]"} transition-colors font-medium`
                                        }`}
                                >
                                    {link.label}
                                </a>
                                {active && (
                                    <span className={`mt-1.5 w-6 h-[4px] ${isTransparent ? "bg-[#f9c146]" : "bg-[#2e3d83]"} rounded-full`} />
                                )}
                            </li>
                        );
                    })}
                </ul>

                {/* Actions (Desktop & Mobile) */}
                <div className={`flex items-center gap-2 sm:gap-4 ${isTransparent ? "text-white" : "text-[#2e3d83]"} shrink-0`}>
                    {!mounted ? (
                        <div className="hidden md:block h-10 w-24 bg-white/5 animate-pulse rounded-[5px]" />
                    ) : isAuthenticated ? (
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Star Icon (Favorites/Wishlist) */}
                            <a 
                                href="/my-profile?tab=wishlist"
                                className={`p-2 rounded-full hover:bg-white/20 transition-all shrink-0 ${isTransparent ? "text-white hover:text-[#f9c146]" : "text-[#2e3d83] hover:text-[#3b4fa8]"}`}
                            >
                                <Star size={22} />
                            </a>

                            {/* Bell Icon (Notification Dropdown) */}
                            <NotificationDropdown isTransparent={isTransparent} />

                            {/* Car Profile Menu Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className={`flex items-center gap-1 p-2 rounded-full hover:bg-white/20 transition-all shrink-0 ${isTransparent ? "text-white hover:text-[#f9c146]" : "text-[#2e3d83] hover:text-[#3b4fa8]"}`}
                                >
                                    <Car size={24} />
                                    <ChevronDown size={14} className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                                </button>
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl py-2 z-[60] text-[#2e3d83] border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button 
                                            onClick={() => { router.push("/my-profile?tab=personal"); setShowProfileMenu(false); }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium border-b border-gray-50"
                                        >
                                            <User size={16} className="text-[#545677]" /> My Profile
                                        </button>
                                        <button 
                                            onClick={() => { router.push("/my-profile?tab=my-bids"); setShowProfileMenu(false); }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium border-b border-gray-50"
                                        >
                                            <Hammer size={16} className="text-[#545677]" /> My Bids
                                        </button>
                                        <button 
                                            onClick={() => { router.push("/my-profile?tab=my-cars"); setShowProfileMenu(false); }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium border-b border-gray-50"
                                        >
                                            <Car size={16} className="text-[#545677]" /> My Cars
                                        </button>
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 text-sm font-bold text-red-600"
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (pathname !== "/login" && pathname !== "/register") ? (
                        <div className="hidden md:flex items-center gap-3">
                            <p className="mr-2 h-full flex items-center">
                                <button 
                                    onClick={() => router.push("/login")} 
                                    className={`text-sm font-medium mr-1 ${isTransparent ? "text-white hover:text-[#f9c146]" : "text-[#898989] hover:text-[#2e3d83]"} transition-colors`}
                                >
                                    Sign in
                                </button>
                                <span className="text-sm font-medium text-[#898989] pl-2">or</span>
                            </p>
                            <button 
                                onClick={() => router.push("/register")}
                                className="bg-[#3b4fa8] text-white px-5 py-2.5 rounded-[8px] font-medium text-sm hover:bg-[#2e3d83] transition-all"
                            >
                                Register now
                            </button>
                        </div>
                    ) : null}

                    {/* Mobile hamburger */}
                    <button
                        className={`md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors ${isTransparent ? "text-white" : "text-[#2e3d83]"}`}
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden flex flex-col bg-[#e8edfa] border-t border-[#eaecf3] px-5 py-4 gap-3">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className={`text-base py-2 border-b border-[#eaecf3] ${pathname === link.href
                                ? "font-bold text-[#2e3d83]"
                                : "font-normal text-[#545677]"
                                }`}
                        >
                            {link.label}
                        </a>
                    ))}
                    {!mounted ? (
                        <div className="h-12 bg-gray-200/50 animate-pulse rounded-md mt-2" />
                    ) : !isAuthenticated ? (
                        <button 
                            onClick={() => { router.push("/login"); setOpen(false); }}
                            className="bg-[#2e3d83] text-white py-3 rounded-md font-bold mt-2"
                        >
                            Login / Register
                        </button>
                    ) : (
                        <div className="flex flex-col gap-1 mt-2">
                            <div className="bg-white/50 p-4 rounded-xl flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-[#2e3d83] rounded-full flex items-center justify-center text-white">
                                    <User size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-[#2e3d83]">{user?.firstName} {user?.lastName}</span>
                                    <span className="text-xs text-[#545677] truncate max-w-[180px]">{user?.email}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => { router.push("/my-profile?tab=personal"); setOpen(false); }}
                                className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-white text-[#545677] font-medium transition-colors"
                            >
                                <User size={18} /> My Profile
                            </button>
                            <button 
                                onClick={() => { router.push("/my-profile?tab=my-bids"); setOpen(false); }}
                                className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-white text-[#545677] font-medium transition-colors"
                            >
                                <Hammer size={18} /> My Bids
                            </button>
                            <button 
                                onClick={() => { router.push("/my-profile?tab=my-cars"); setOpen(false); }}
                                className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-white text-[#545677] font-medium transition-colors"
                            >
                                <Car size={18} /> My Cars
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-red-50 text-red-600 font-bold transition-colors mt-2"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}