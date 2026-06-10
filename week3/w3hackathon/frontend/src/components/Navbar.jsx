import React, { useState } from 'react';
import { Search, User, ShoppingBag, X, Sun, Moon, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronDown, ClipboardList } from 'lucide-react';
import OrderHistoryModal from './OrderHistoryModal';
import { useTheme } from '../context/ThemeContext';


const Navbar = ({ onOpenCart }) => {
    const { cartItems, notification } = useCart();
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');


    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            console.log('Searching for:', searchQuery);
            // Add your search logic here
            setSearchQuery('');
            setIsSearchOpen(false);
        }
    };

    return (
        <nav className="flex items-center justify-between px-6 py-5 bg-white dark:bg-[#0A0A0A] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8">
                    <img src="/images/psychiatry.png" alt="Logo" className="w-full h-full object-contain dark:invert transition-all duration-300" />
                </div>
                <span className="text-xl font-bold tracking-widest uppercase text-black dark:text-white font-['Prosto_One']">SR TEA</span>
            </div>


            {/* Menu Links - Hidden on Mobile/Tablet */}
            <div className="hidden lg:flex items-center gap-8 text-[12px] font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
                <Link to="/collections/chai" className="hover:text-black dark:hover:text-white transition-colors">Tea Collections</Link>

                <button 
                    onClick={() => alert('This features is under working')}
                    className="hover:text-black dark:hover:text-white transition-colors cursor-pointer uppercase font-semibold tracking-widest"
                >
                    Accessories
                </button>
                <button 
                    onClick={() => alert('This features is under working')}
                    className="hover:text-black dark:hover:text-white transition-colors cursor-pointer uppercase font-semibold tracking-widest"
                >
                    Blog
                </button>
                <button 
                    onClick={() => {
                        const contactSection = document.getElementById('contact-us');
                        if (contactSection) {
                            contactSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    className="hover:text-black dark:hover:text-white transition-colors cursor-pointer uppercase font-semibold tracking-widest"
                >
                    Contact Us
                </button>
            </div>

            {/* Desktop Icons */}
            <div className="hidden lg:flex items-center gap-5 text-gray-700 dark:text-gray-300">

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </motion.button>
                <Search 
                    size={20} 
                    className="cursor-pointer hover:text-black dark:hover:text-white transition-colors" 
                    onClick={() => setIsSearchOpen(true)}
                />

                {user ? (
                    <div className="flex items-center gap-4">
                        {(user.role === 'admin' || user.role === 'superadmin') && (
                            <Link 
                                to="/admin" 
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-sm"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
                            </Link>
                        )}
                        <div className="relative">
                            <motion.button 
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 text-white flex items-center justify-center text-[13px] font-bold uppercase shadow-lg shadow-blue-500/20 border-2 border-white">
                                    {user.name.charAt(0)}
                                </div>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                            </motion.button>

                            <AnimatePresence>
                                {isUserDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)}></div>
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 z-50"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 mb-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logged in as</p>
                                                <p className="text-[13px] font-bold text-black dark:text-white truncate">{user.name}</p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => {
                                                    setIsOrderHistoryOpen(true);
                                                    setIsUserDropdownOpen(false);
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                                            >
                                                <ClipboardList size={18} className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                                Order History
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    logout();
                                                    setIsUserDropdownOpen(false);
                                                    navigate('/');
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group mt-1"
                                            >
                                                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                                Logout
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    <User 
                        size={20} 
                        className="cursor-pointer hover:text-black dark:hover:text-white transition-colors" 
                        onClick={() => navigate('/login')}
                    />
                )}
                <div 
                    className="relative cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                    onClick={onOpenCart}
                >
                    <ShoppingBag size={20} />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-2 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                            {cartCount}
                        </span>
                    )}
                    
                    {/* Floating Notification */}
                    <AnimatePresence>
                        {notification && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full mt-3 right-0 w-48 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold py-2 px-3 rounded shadow-xl text-center pointer-events-none z-[70]"
                            >
                                <div className="absolute -top-1 right-3 w-2 h-2 bg-black dark:bg-white rotate-45"></div>
                                {notification}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile/Tablet Menu Button */}
            <div className="flex lg:hidden items-center gap-2 text-gray-700 dark:text-gray-300">
                <div 
                    className="relative cursor-pointer hover:text-black dark:hover:text-white transition-colors p-2"
                    onClick={onOpenCart}
                >
                    <ShoppingBag size={22} />
                    {cartCount > 0 && (
                        <span className="absolute top-1 right-0 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                            {cartCount}
                        </span>
                    )}
                </div>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.button>
            </div>


            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 top-[76px] bg-white dark:bg-[#0A0A0A] z-50 lg:hidden overflow-y-auto"
                    >
                        <div className="flex flex-col p-6 gap-8">
                            {/* Theme Toggle & Close */}
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settings</p>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleTheme}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-full text-[12px] font-bold text-black dark:text-white border border-gray-100 dark:border-gray-800"
                                >
                                    {isDarkMode ? (
                                        <><Sun size={16} /> Light Mode</>
                                    ) : (
                                        <><Moon size={16} /> Dark Mode</>
                                    )}
                                </motion.button>
                            </div>

                            {/* Mobile Search */}
                            <form onSubmit={handleSearch} className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search store..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-xl px-12 py-4 text-sm outline-none text-black dark:text-white"
                                />
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </form>

                            {/* Links */}
                            <div className="flex flex-col gap-6">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigation</p>
                                <Link 
                                    to="/collections/chai" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-xl font-bold text-black dark:text-white flex items-center justify-between"
                                >
                                    Tea Collections
                                    <ChevronDown size={18} className="-rotate-90 text-gray-300" />
                                </Link>
                                <button className="text-xl font-bold text-black dark:text-white text-left flex items-center justify-between">
                                    Accessories
                                    <ChevronDown size={18} className="-rotate-90 text-gray-300" />
                                </button>
                                <button className="text-xl font-bold text-black dark:text-white text-left flex items-center justify-between">
                                    Blog
                                    <ChevronDown size={18} className="-rotate-90 text-gray-300" />
                                </button>
                                <button className="text-xl font-bold text-black dark:text-white text-left flex items-center justify-between">
                                    Contact Us
                                    <ChevronDown size={18} className="-rotate-90 text-gray-300" />
                                </button>
                            </div>

                            {/* User & Cart Section */}
                            <div className="flex flex-col gap-4 pt-8 border-t border-gray-50 dark:border-gray-900">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            onOpenCart();
                                        }}
                                        className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag size={18} />
                                        Cart ({cartCount})
                                    </button>
                                    {!user && (
                                        <button 
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                navigate('/login');
                                            }}
                                            className="flex-1 bg-gray-50 dark:bg-[#1A1A1A] text-black dark:text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                        >
                                            <User size={18} />
                                            Login
                                        </button>
                                    )}
                                </div>
                                
                                {user && (
                                    <div className="flex flex-col gap-2">
                                        <div className="p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Account</p>
                                                <p className="text-[13px] font-bold text-black dark:text-white leading-none">{user.name}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => {
                                                    setIsOrderHistoryOpen(true);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="bg-gray-50 dark:bg-[#1A1A1A] p-4 rounded-xl text-[12px] font-bold text-black dark:text-white flex items-center gap-2"
                                            >
                                                <ClipboardList size={16} />
                                                Orders
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    logout();
                                                    setIsMobileMenuOpen(false);
                                                    navigate('/');
                                                }}
                                                className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl text-[12px] font-bold text-red-500 flex items-center gap-2"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                        {(user.role === 'admin' || user.role === 'superadmin') && (
                                            <Link 
                                                to="/admin"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm text-center"
                                            >
                                                Admin Dashboard
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Bar Overlay - Premium Framer Motion Animation */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute top-full right-12 w-full max-w-2xl px-6 pt-0 z-[60] hidden lg:block"
                    >

                        <form onSubmit={handleSearch} className="p-[2.5px] rounded-full bg-gradient-to-r from-teal-400 via-blue-500 via-purple-500 via-pink-500 to-orange-400 shadow-2xl">
                            <div className="flex items-center w-full bg-white dark:bg-[#1A1A1A] rounded-full px-6 py-3 transition-all">
                                <Search size={18} className="text-gray-400 mr-3" />
                                <input 
                                    type="text" 
                                    placeholder="SEARCH OUR STORE..." 
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full text-sm outline-none bg-transparent font-medium tracking-wider placeholder:text-gray-300 dark:placeholder:text-gray-600 text-black dark:text-white"
                                />
                                <div className="flex items-center gap-2">
                                    <button 
                                        type="submit"
                                        className="bg-gradient-to-r from-teal-500 to-purple-600 text-white text-[10px] font-bold tracking-widest px-6 py-2 rounded-full hover:opacity-90 transition-all uppercase shadow-md"
                                    >
                                        Search
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setIsSearchOpen(false);
                                        }}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                    >
                                        <X size={18} className="text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <OrderHistoryModal 
                isOpen={isOrderHistoryOpen} 
                onClose={() => setIsOrderHistoryOpen(false)} 
            />
        </nav>
    );
};

export default Navbar;
