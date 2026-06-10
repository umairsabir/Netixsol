import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Users, 
    ShoppingBag, 
    Package, 
    Settings, 
    LogOut,
    TrendingUp,
    Clock,
    AlertCircle,
    ChevronRight,
    Search,
    Menu,
    X,
    Filter,
    Bell,
    ChevronDown,
    Shield,
    Plus,
    Edit,
    Trash2,
    Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';

const originOptions = ["India", "Japan", "Iran", "South Africa", "China", "Sri Lanka"];
const flavourOptions = ["Spicy", "Sweet", "Citrus", "Smooth", "Fruity", "Floral", "Grassy", "Minty", "Bitter", "Creamy"];
const qualityOptions = ["Detox", "Energy", "Relax", "Digestion"];
const caffeineOptions = ["No Caffeine", "Low Caffeine", "Medium Caffeine", "High Caffeine"];
const allergenOptions = ["Lactose-free", "Gluten-free", "Nuts-free", "Soy-free", "None"];

const AdminDashboard = () => {
    const { user: loggedInUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [admins, setAdmins] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        subtitle: '',
        price: '',
        collection: 'Green Tea',
        description: '',
        image: '',
        isOrganic: false,
        unit: '/ 50 g',
        origin: originOptions[0],
        flavour: flavourOptions[0],
        quality: qualityOptions[0],
        caffeine: caffeineOptions[0],
        allergen: allergenOptions[0],
        variants: [
            { label: '50 g bag', multiplier: 1, stock: 0 },
            { label: '100 g bag', multiplier: 2, stock: 0 }
        ]
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'New order received', time: '5m ago' },
        { id: 2, text: 'User "John Doe" registered', time: '12m ago' }
    ]);

    const calculateMultiplier = (label, baseUnit) => {
        const extractNum = (str) => {
            if (!str) return null;
            const s = str.toLowerCase().replace(/\s/g, '');
            if (s.includes('sampler')) return 0.5; // Example from user data
            const match = s.match(/(\d+\.?\d*)(g|kg|ml|l)?/);
            if (!match) return null;
            let val = parseFloat(match[1]);
            const unit = match[2];
            if (unit === 'kg' || unit === 'l') val *= 1000;
            return val;
        };
        const baseVal = extractNum(baseUnit);
        const variantVal = extractNum(label);
        if (baseVal && variantVal) {
            return parseFloat((variantVal / baseVal).toFixed(2));
        }
        return null;
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, usersRes, ordersRes, productsRes] = await Promise.all([
                API.get('/admin/stats'),
                API.get('/admin/users'),
                API.get('/orders'),
                API.get('/products?limit=100')
            ]);

            // Check for new orders to show notification
            if (orders.length > 0 && ordersRes.data.data.length > orders.length) {
                const newOrder = ordersRes.data.data[0];
                setNotifications(prev => [{
                    id: Date.now(),
                    text: `New order #${newOrder._id.slice(-6)} received from ${newOrder.user?.name}`,
                    time: 'Just now'
                }, ...prev]);
            }

            // Check for low stock alerts
            if (statsRes.data.data.lowStockProducts?.length > 0) {
                const lowStock = statsRes.data.data.lowStockProducts[0];
                const notifExists = notifications.some(n => n.text.includes(lowStock.name));
                if (!notifExists) {
                    setNotifications(prev => [{
                        id: Date.now() + 1,
                        text: `Alert: ${lowStock.name} is running low on stock (${lowStock.stock} left)`,
                        time: 'Just now'
                    }, ...prev]);
                }
            }

            setStats(statsRes.data.data);
            const allUsers = usersRes.data.data;
            setUsers(allUsers.filter(u => u.role === 'user'));
            setAdmins(allUsers.filter(u => u.role === 'admin' || u.role === 'superadmin'));
            setOrders(ordersRes.data.data);
            setProducts(productsRes.data.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await API.delete(`/products/${id}`);
            setProducts(products.filter(p => p._id !== id));
            // Update stats if needed
            fetchDashboardData();
        } catch (err) {
            console.error('Error deleting product:', err);
            alert('Failed to delete product');
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/products', {
                ...newProduct,
                collectionName: newProduct.collection
            });
            setProducts([...products, res.data.data]);
            setIsAddModalOpen(false);
            setNewProduct({
                name: '',
                subtitle: '',
                price: '',
                collection: 'Green Tea',
                description: '',
                image: '',
                isOrganic: false,
                unit: '/ 50 g',
                origin: originOptions[0],
                flavour: flavourOptions[0],
                quality: qualityOptions[0],
                caffeine: caffeineOptions[0],
                allergen: allergenOptions[0],
                variants: [
                    { label: '50 g bag', multiplier: 1, stock: 0 },
                    { label: '100 g bag', multiplier: 2, stock: 0 }
                ]
            });
        } catch (err) {
            console.error('Error adding product:', err);
            alert('Failed to add product');
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct({ 
            ...product, 
            collection: product.collectionName || 'Green Tea',
            variants: product.variants || [{ label: '50 g bag', multiplier: 1, stock: 0 }, { label: '100 g bag', multiplier: 2, stock: 0 }]
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await API.patch(`/products/${editingProduct._id}`, {
                ...editingProduct,
                collectionName: editingProduct.collection
            });
            setProducts(products.map(p => p._id === editingProduct._id ? res.data.data : p));
            setIsEditModalOpen(false);
            setEditingProduct(null);
            fetchDashboardData();
        } catch (err) {
            console.error('Error updating product:', err);
            alert('Failed to update product');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setIsNotificationsOpen(false);
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 30000);
        return () => clearInterval(interval);
    }, [orders.length, notifications]);

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            await API.patch(`/admin/users/${userId}/status`, { isBlocked: !currentStatus });
            fetchDashboardData();
        } catch (err) {
            console.error('Error toggling user status:', err);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await API.patch(`/orders/${orderId}/status`, { status: newStatus });
            fetchDashboardData();
        } catch (err) {
            console.error('Error updating order status:', err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[12px] font-bold tracking-[0.2em] uppercase">Loading Panel...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-500 flex flex-col font-['Montserrat']">
            <header className="h-16 bg-gray-50 border-b border-gray-400 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 w-full">
                <div className="flex items-center gap-8">
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 shrink-0 cursor-pointer"
                    >
                        <motion.div 
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="w-7 h-7"
                        >
                            <img src="/images/psychiatry.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
                        </motion.div>
                        <motion.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-base font-bold tracking-widest uppercase text-black font-['Prosto_One'] relative group"
                        >
                            SR TEA
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
                        </motion.span>
                    </motion.div>
                    
                    <div className="hidden sm:flex items-center gap-4 text-black border-l border-gray-400 pl-8">
                        <span className="text-[11px] font-bold uppercase tracking-widest opacity-50">Dashboard</span>
                        <ChevronRight size={14} className="opacity-30" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-black">{activeTab}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block group">
                        <motion.div 
                            initial={false}
                            whileFocus={{ width: 280 }}
                            className="relative flex items-center"
                        >
                            <Search className="absolute left-3 text-black group-focus-within:text-blue-600 transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search anything..." 
                                className="bg-white border border-gray-400 rounded-full py-1.5 pl-10 pr-4 text-[13px] focus:ring-2 focus:ring-black outline-none w-48 transition-all focus:w-64 text-black placeholder:text-black/50"
                            />
                        </motion.div>
                    </div>

                    <div className="relative dropdown-container">
                        <button 
                            onClick={() => {
                                setIsNotificationsOpen(!isNotificationsOpen);
                                setIsProfileOpen(false);
                            }}
                            className="p-2 rounded-full hover:bg-gray-100 transition-all relative group"
                        >
                            <Bell size={18} className="text-black group-hover:rotate-12 transition-transform" />
                            {notifications.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotificationsOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-400 overflow-hidden z-50"
                                >
                                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                        <h3 className="text-[13px] font-bold text-black">Notifications</h3>
                                        {notifications.length > 0 && (
                                            <button 
                                                onClick={() => setNotifications([])}
                                                className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif, idx) => (
                                                <div key={notif.id} className={`px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0`}>
                                                    <div className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                            <AlertCircle size={14} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[12px] text-black font-medium leading-relaxed">{notif.text}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1 font-bold">{notif.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-5 py-10 text-center">
                                                <p className="text-[12px] text-gray-400 font-medium">No new notifications</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-5 py-3 border-t border-gray-50 text-center bg-gray-50/30">
                                        <button 
                                            onClick={() => {
                                                setIsNotificationsOpen(false);
                                                setActiveTab('overview');
                                            }}
                                            className="text-[11px] font-bold text-black hover:opacity-70"
                                        >
                                            View All Activity
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative dropdown-container">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-400"
                        >
                            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-[11px]">
                                AD
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-300 text-black ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-400 p-2 z-50"
                                >
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account Status</p>
                                        <p className="text-[13px] font-bold text-green-500 flex items-center gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            Verified Admin
                                        </p>
                                    </div>
                                    <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] font-bold text-black hover:bg-gray-50 transition-all group">
                                        <Settings size={18} className="text-black group-hover:rotate-45 transition-transform" />
                                        Admin Settings
                                    </button>
                                    <button 
                                        onClick={logout}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] font-bold text-red-500 hover:bg-red-50 transition-all group mt-1"
                                    >
                                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            <div className="flex flex-grow h-[calc(100vh-64px)] overflow-hidden">
                <motion.aside 
                    initial={false}
                    animate={{ width: isSidebarOpen ? 260 : 80 }}
                    className="bg-[#0f172a] border-r border-white/5 flex flex-col z-40 relative text-white h-full shadow-2xl"
                >
                    <div className={`p-4 flex items-center border-b border-white/5 ${isSidebarOpen ? 'justify-end pr-2' : 'justify-center'}`}>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-xl transition-all text-white">
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    <nav className="flex-grow px-3 py-6 space-y-2 overflow-y-auto">
                        <NavItem 
                            icon={<LayoutDashboard size={20} />} 
                            label="Overview" 
                            isActive={activeTab === 'overview'} 
                            onClick={() => setActiveTab('overview')}
                            isCollapsed={!isSidebarOpen}
                        />
                        <NavItem 
                            icon={<Users size={20} />} 
                            label="Users" 
                            isActive={activeTab === 'users'} 
                            onClick={() => setActiveTab('users')}
                            isCollapsed={!isSidebarOpen}
                        />
                        <NavItem 
                            icon={<Shield size={20} />} 
                            label="Admins" 
                            isActive={activeTab === 'admins'} 
                            onClick={() => setActiveTab('admins')}
                            isCollapsed={!isSidebarOpen}
                        />
                        <NavItem 
                            icon={<ShoppingBag size={20} />} 
                            label="Orders" 
                            isActive={activeTab === 'orders'} 
                            onClick={() => setActiveTab('orders')}
                            isCollapsed={!isSidebarOpen}
                        />
                        <NavItem 
                            icon={<Package size={20} />} 
                            label="Inventory" 
                            isActive={activeTab === 'inventory'} 
                            onClick={() => setActiveTab('inventory')}
                            isCollapsed={!isSidebarOpen}
                        />
                    </nav>

                    <div className="p-4 border-t border-white/5">
                        <button 
                            onClick={logout}
                            className={`flex items-center gap-4 text-white hover:text-red-400 transition-colors w-full px-4 py-3 rounded-xl hover:bg-white/5 group`}
                        >
                            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                            {isSidebarOpen && <span className="text-[14px] font-medium">Exit Panel</span>}
                        </button>
                    </div>
                </motion.aside>

                <main className={`flex-grow overflow-y-auto scrollbar-hide ${activeTab === 'overview' ? 'overflow-hidden' : ''}`}>
                    <div className={`p-4 md:p-6 pb-10 max-w-7xl mx-auto h-full ${activeTab === 'overview' ? 'overflow-hidden' : ''}`}>
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fadeIn h-full flex flex-col">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {loading ? (
                                    [...Array(4)].map((_, i) => (
                                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-400 flex items-center justify-between animate-pulse">
                                            <div className="space-y-3">
                                                <div className="h-2 w-20 bg-gray-100 rounded-full"></div>
                                                <div className="h-6 w-12 bg-gray-100 rounded-full"></div>
                                            </div>
                                            <div className="w-14 h-14 bg-gray-50 rounded-2xl"></div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <StatCard label="Total Revenue" value={`€  ${stats?.totalRevenue?.toFixed(2) || '0.00'}`} icon={<TrendingUp className="text-green-500" />} color="bg-green-50" />
                                        <StatCard label="Total Orders" value={stats?.totalOrders || 0} icon={<ShoppingBag className="text-blue-500" />} color="bg-blue-50" />
                                        <StatCard label="Active Users" value={stats?.totalUsers || 0} icon={<Users className="text-purple-500" />} color="bg-purple-50" />
                                        <StatCard label="Weekly Revenue" value={`€  ${stats?.weeklyRevenue?.toFixed(2) || '0.00'}`} icon={<TrendingUp className="text-emerald-500" />} color="bg-emerald-50" />
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow overflow-hidden">
                                <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-400 p-6 pb-2 flex flex-col overflow-hidden">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-[16px] font-black text-black">Recent Orders</h2>
                                        <button 
                                            onClick={() => setActiveTab('orders')}
                                            className="text-[12px] font-black text-black hover:opacity-70 uppercase tracking-widest"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-[11px] font-black uppercase tracking-widest text-black border-b border-gray-50">
                                                    <th className="pb-4 pl-4 text-black">Order ID</th>
                                                    <th className="pb-4 text-black">Customer</th>
                                                    <th className="pb-4 text-black">Status</th>
                                                    <th className="pb-4 pr-4 text-right text-black">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {stats?.recentOrders?.map((order, idx) => (
                                                    <motion.tr 
                                                        key={order._id} 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className={`text-[13px] transition-colors ${
                                                            order.status === 'pending' 
                                                                ? 'bg-blue-100 dark:bg-blue-950/30' 
                                                                : order.status === 'shipped'
                                                                    ? 'bg-blue-50/50 dark:bg-blue-950/10'
                                                                    : ''
                                                        }`}
                                                    >
                                                        <td className="py-4 pl-4 font-mono text-black transition-colors">#{order._id.slice(-6)}</td>
                                                        <td className="py-4 font-bold text-black">{order.user?.name}</td>
                                                        <td className="py-4">
                                                            <StatusBadge status={order.status} />
                                                        </td>
                                                        <td className="py-4 pr-4 text-right font-bold text-black">€{order.totalPrice.toFixed(2)}</td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-400 p-6 self-start h-fit">
                                    <h2 className="text-[16px] font-black text-black mb-6">Stock Alerts</h2>
                                    <div className="space-y-6 overflow-y-auto max-h-[250px] pr-2">
                                        {stats?.lowStockProducts?.map(product => (
                                            <div key={product._id} className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-400">
                                                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                                                </div>
                                                <div className="min-w-0 flex-grow">
                                                    <p className="text-[13px] font-bold text-black truncate leading-tight">{product.name}</p>
                                                    <p className={`text-[11px] font-bold uppercase mt-1 ${product.totalStock <= 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                                        {product.totalStock <= 0 ? 'Out of stock' : `${product.totalStock} Units Left`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) && (
                                            <p className="text-[12px] text-gray-400 font-medium italic">No stock alerts</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="bg-white rounded-2xl border border-gray-400 p-8 animate-fadeIn h-fit max-h-[calc(100vh-100px)] flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-[20px] font-bold font-['Prosto_One'] text-black">User Management</h2>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
                                        <input 
                                            type="text" 
                                            placeholder="Search by name or email..." 
                                            className="pl-10 pr-4 py-2 border border-gray-400 rounded-xl text-[13px] text-black focus:outline-none focus:ring-2 focus:ring-black/5 w-64 transition-all"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-grow pr-2">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-[11px] font-bold uppercase tracking-widest text-black border-b border-gray-50">
                                            <th className="pb-4 pl-4 sticky top-0 bg-white">User Name</th>
                                            <th className="pb-4 sticky top-0 bg-white">Email</th>
                                            <th className="pb-4 sticky top-0 bg-white">Role</th>
                                            <th className="pb-4 sticky top-0 bg-white">Status</th>
                                            <th className="pb-4 text-right sticky top-0 bg-white">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                    {users
                                        .filter(u => 
                                            u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                                            u.email.toLowerCase().includes(userSearch.toLowerCase())
                                        )
                                        .map((u, index) => (
                                        <tr key={u._id} className="text-[14px]">
                                            <td className="py-5 flex items-center gap-3">
                                                <span className="font-bold text-black">{u.name}</span>
                                            </td>
                                            <td className="py-5 text-black">{u.email}</td>
                                            <td className="py-5">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded bg-gray-100 text-black`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-5">
                                                <span className={`flex items-center gap-1.5 text-[12px] font-medium ${u.isBlocked ? 'text-red-500' : 'text-green-500'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                    {u.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-5 text-right">
                                                {/* Only superadmin can block/unblock users */}
                                                {loggedInUser?.role === 'superadmin' && (
                                                    <button 
                                                        onClick={() => toggleUserStatus(u._id, u.isBlocked)}
                                                        className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${u.isBlocked ? 'bg-black text-white hover:bg-gray-800' : 'border border-red-500 text-red-500 hover:bg-red-50'}`}
                                                    >
                                                        {u.isBlocked ? 'Unblock' : 'Block'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admins' && (
                        <div className="bg-white rounded-2xl border border-gray-400 p-8 animate-fadeIn h-fit max-h-[calc(100vh-100px)] flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-[20px] font-bold font-['Prosto_One'] text-black">Admin Management</h2>
                            </div>
                            <div className="overflow-y-auto flex-grow pr-2">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-[11px] font-bold uppercase tracking-widest text-black border-b border-gray-50">
                                            <th className="pb-4 sticky top-0 bg-white">Admin Name</th>
                                            <th className="pb-4 sticky top-0 bg-white">Email</th>
                                            <th className="pb-4 sticky top-0 bg-white">Role</th>
                                            <th className="pb-4 sticky top-0 bg-white">Status</th>
                                            <th className="pb-4 text-right sticky top-0 bg-white">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                    {admins.map((admin) => (
                                        <tr key={admin._id} className="text-[14px]">
                                            <td className="py-5">
                                                <span className="font-bold text-black">{admin.name}</span>
                                            </td>
                                            <td className="py-5 text-black">{admin.email}</td>
                                            <td className="py-5">
                                                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-black text-white">
                                                    {admin.role}
                                                </span>
                                            </td>
                                            <td className="py-5">
                                                <span className={`flex items-center gap-1.5 text-[12px] font-medium ${admin.isBlocked ? 'text-red-500' : 'text-green-500'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${admin.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                    {admin.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-5 text-right">
                                                {/* Only superadmin can block other admins */}
                                                {loggedInUser?.role === 'superadmin' && (
                                                    <button 
                                                        onClick={() => toggleUserStatus(admin._id, admin.isBlocked)}
                                                        className="text-black hover:opacity-70 font-bold text-[12px] uppercase tracking-widest"
                                                    >
                                                        {admin.isBlocked ? 'Unblock' : 'Block'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-2xl border border-gray-400 p-8 animate-fadeIn h-fit max-h-[calc(100vh-100px)] flex flex-col">
                            <h2 className="text-[20px] font-bold font-['Prosto_One'] text-black mb-8">Orders</h2>
                            <div className="overflow-y-auto flex-grow pr-2">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-[11px] font-bold uppercase tracking-widest text-black border-b border-gray-50">
                                            <th className="pb-4 sticky top-0 bg-white">Order</th>
                                            <th className="pb-4 sticky top-0 bg-white">Date</th>
                                            <th className="pb-4 sticky top-0 bg-white">Amount</th>
                                            <th className="pb-4 sticky top-0 bg-white">Status</th>
                                            <th className="pb-4 sticky top-0 bg-white text-center">Detail</th>
                                            <th className="pb-4 text-right sticky top-0 bg-white">Manage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                    {orders.map(order => (
                                        <tr 
                                            key={order._id} 
                                            className={`text-[14px] transition-colors ${
                                                order.status === 'pending' 
                                                    ? 'bg-blue-100 dark:bg-blue-950/30' 
                                                    : order.status === 'shipped'
                                                        ? 'bg-blue-50/50 dark:bg-blue-950/10'
                                                        : ''
                                            }`}
                                        >
                                            <td className="py-5 pl-4 text-black">
                                                <p className="font-bold text-[13px]">#{order._id.slice(-8)}</p>
                                                <p className="text-[11px] text-black uppercase tracking-widest mt-0.5">{order.user?.name}</p>
                                            </td>
                                            <td className="py-5 text-black">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="py-5 font-bold text-black">€{order.totalPrice.toFixed(2)}</td>
                                            <td className="py-5">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="py-5 text-center">
                                                <button 
                                                    onClick={() => setViewingOrder(order)}
                                                    className="p-2 hover:bg-gray-50 rounded-lg text-black transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                            <td className="py-5 pr-4 text-right">
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    disabled={order.status === 'cancelled'}
                                                    className={`bg-gray-50 border-none text-[12px] font-bold text-black rounded-lg px-3 py-2 focus:ring-0 ${order.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <option value="pending" className="text-black">Pending</option>
                                                    <option value="shipped" className="text-black">Shipped</option>
                                                    <option value="delivered" className="text-black">Delivered</option>
                                                    <option value="cancelled" className="text-black">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    )}

                    {/* Order Details Modal */}
                    <AnimatePresence>
                        {viewingOrder && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setViewingOrder(null)}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                />
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    className="relative bg-white rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                                >
                                    <div className="bg-[#064e3b] px-8 py-5 text-white relative overflow-hidden">
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex items-center gap-4">
                                                <h2 className="text-[15px] font-bold font-['Prosto_One'] tracking-[0.3em]">Order Details</h2>
                                                <span className="bg-white/20 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest">#{viewingOrder._id.slice(-8)}</span>
                                            </div>
                                            <button onClick={() => setViewingOrder(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-grow overflow-y-auto p-8 custom-scrollbar space-y-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h3 className="text-[12px] font-bold text-black uppercase tracking-widest border-b border-gray-100 pb-2">Customer Information</h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Name</p>
                                                        <p className="text-[14px] font-bold text-black">{viewingOrder.user?.name || viewingOrder.shippingAddress?.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                                                        <p className="text-[14px] font-bold text-black">{viewingOrder.user?.email || viewingOrder.shippingAddress?.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-[12px] font-bold text-black uppercase tracking-widest border-b border-gray-100 pb-2">Shipping Address</h3>
                                                <div className="space-y-1 text-[14px] font-bold text-black">
                                                    <p>{viewingOrder.shippingAddress?.address}</p>
                                                    <p>{viewingOrder.shippingAddress?.city}, {viewingOrder.shippingAddress?.postalCode}</p>
                                                    <p>{viewingOrder.shippingAddress?.country}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-[12px] font-bold text-black uppercase tracking-widest border-b border-gray-100 pb-2">Ordered Items</h3>
                                            <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-400">
                                                <table className="w-full">
                                                    <thead className="bg-white">
                                                        <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-black">
                                                            <th className="px-6 py-4">Item</th>
                                                            <th className="px-6 py-4">Variant</th>
                                                            <th className="px-6 py-4">Qty</th>
                                                            <th className="px-6 py-4 text-right">Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {viewingOrder.items.map((item, idx) => (
                                                            <tr key={idx} className="text-[13px]">
                                                                <td className="px-6 py-4 font-bold text-black">{item.name}</td>
                                                                <td className="px-6 py-4 text-black uppercase text-[11px] font-bold">{item.selectedVariant}</td>
                                                                <td className="px-6 py-4 font-bold text-black">x{item.quantity}</td>
                                                                <td className="px-6 py-4 text-right font-bold text-black">€{(item.price * item.quantity).toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                                                <StatusBadge status={viewingOrder.status} />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[12px] font-bold text-gray-400 uppercase mb-1">Total Amount</p>
                                                <p className="text-[28px] font-bold text-black leading-none">€{viewingOrder.totalPrice.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-gray-50 flex justify-end">
                                        <button 
                                            onClick={() => setViewingOrder(null)}
                                            className="px-8 py-3 bg-black text-white rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-gray-800 transition-all"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {activeTab === 'inventory' && (
                        <div className="bg-white rounded-2xl border border-gray-400 p-8 animate-fadeIn h-fit max-h-[calc(100vh-100px)] flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-[20px] font-bold font-['Prosto_One'] text-black">Inventory Management</h2>
                                <button 
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-gray-800 transition-all"
                                >
                                    <Plus size={16} /> Add Product
                                </button>
                            </div>
                            <div className="overflow-y-auto flex-grow pr-2">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-[11px] font-bold uppercase tracking-widest text-black border-b border-gray-50">
                                            <th className="pb-4 sticky top-0 bg-white">Product</th>
                                            <th className="pb-4 sticky top-0 bg-white">Category</th>
                                            <th className="pb-4 sticky top-0 bg-white">Price</th>
                                            <th className="pb-4 sticky top-0 bg-white">Stock</th>
                                            <th className="pb-4 text-right sticky top-0 bg-white">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {products.map((product) => (
                                            <tr key={product._id} className="text-[14px]">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                                                            {product.image ? (
                                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package size={20} className="text-gray-300" />
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-black">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">
                                                        {product.collectionName || 'General'}
                                                    </span>
                                                </td>
                                                <td className="py-4 font-bold text-black">
                                                    €{product.price.toFixed(2)}
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex flex-col gap-1">
                                                        {(() => {
                                                            const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
                                                            return (
                                                                <>
                                                                    <span className={`font-bold ${totalStock < 10 ? 'text-red-500' : 'text-black'}`}>
                                                                        {totalStock} units
                                                                    </span>
                                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                        <div 
                                                                            className={`h-full rounded-full ${totalStock < 10 ? 'bg-red-500' : 'bg-green-500'}`}
                                                                            style={{ width: `${Math.min((totalStock / 50) * 100, 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleEditClick(product)}
                                                            className="p-2 hover:bg-gray-50 rounded-lg text-black transition-colors"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteProduct(product._id)}
                                                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Add Product Modal */}
                    <AnimatePresence>
                        {isAddModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                />
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    className="relative bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                                >
                                    <div className="bg-[#064e3b] px-8 py-5 text-white relative overflow-hidden">
                                        <div className="flex justify-between items-center relative z-10">
                                            <h2 className="text-[15px] font-bold font-['Prosto_One'] tracking-[0.3em]">Create New Product</h2>
                                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </div>
                                    <form onSubmit={handleAddProduct} className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-6">
                                                <div className="group">
                                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Product Name</label>
                                                    <input required type="text" className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="Product Name" />
                                                </div>
                                                <div className="group">
                                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Subtitle</label>
                                                    <input required type="text" className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={newProduct.subtitle} onChange={(e) => setNewProduct({...newProduct, subtitle: e.target.value})} placeholder="Subtitle" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="group">
                                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Price (€)</label>
                                                        <input required type="number" step="0.01" className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] font-bold text-black" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                                                    </div>
                                                    <div className="group">
                                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Base Unit</label>
                                                        <input required type="text" className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={newProduct.unit} onChange={(e) => {
                                                            const newUnit = e.target.value;
                                                            const updatedVariants = newProduct.variants.map(v => {
                                                                const autoMultiplier = calculateMultiplier(v.label, newUnit);
                                                                return autoMultiplier !== null ? { ...v, multiplier: autoMultiplier } : v;
                                                            });
                                                            setNewProduct({...newProduct, unit: newUnit, variants: updatedVariants});
                                                        }} placeholder="/ 50 g" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="group">
                                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Collection</label>
                                                    <select className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={newProduct.collection} onChange={(e) => setNewProduct({...newProduct, collection: e.target.value})}>
                                                        <option value="Black teas">Black teas</option>
                                                        <option value="Green teas">Green teas</option>
                                                        <option value="White teas">White teas</option>
                                                        <option value="Matcha">Matcha</option>
                                                        <option value="Herbal teas">Herbal teas</option>
                                                        <option value="Chai">Chai</option>
                                                        <option value="Oolong">Oolong</option>
                                                        <option value="Rooibos">Rooibos</option>
                                                        <option value="Teaware">Teaware</option>
                                                    </select>
                                                </div>
                                                <div className="group">
                                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Image URL</label>
                                                    <input required type="text" className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} placeholder="Image URL" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="group">
                                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Origin</label>
                                                        <select className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={newProduct.origin} onChange={(e) => setNewProduct({...newProduct, origin: e.target.value})}>
                                                            {originOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="group">
                                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Flavour</label>
                                                        <select className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={newProduct.flavour} onChange={(e) => setNewProduct({...newProduct, flavour: e.target.value})}>
                                                            {flavourOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-gray-100">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-[14px] font-bold text-black uppercase tracking-widest">Product Variants</h3>
                                                <button type="button" onClick={() => setNewProduct({...newProduct, variants: [...newProduct.variants, { label: '', multiplier: 1, stock: 0 }]})} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
                                                    <Plus size={14} /> Add Variant
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {newProduct.variants.map((variant, index) => (
                                                    <div key={index} className="grid grid-cols-12 gap-4 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-400">
                                                        <div className="col-span-5">
                                                            <label className="block text-[10px] font-bold text-black uppercase mb-2">Label</label>
                                                            <input type="text" className="w-full bg-white border border-gray-400 rounded-xl px-3 py-2 text-[13px] text-black" value={variant.label} onChange={(e) => {
                                                                const updated = [...newProduct.variants];
                                                                updated[index].label = e.target.value;
                                                                const autoMultiplier = calculateMultiplier(e.target.value, newProduct.unit);
                                                                if (autoMultiplier !== null) {
                                                                    updated[index].multiplier = autoMultiplier;
                                                                }
                                                                setNewProduct({...newProduct, variants: updated});
                                                            }} placeholder="100 g bag" />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <label className="block text-[10px] font-bold text-black uppercase mb-2">Multiplier</label>
                                                            <input type="number" step="0.1" className="w-full bg-white border border-gray-400 rounded-xl px-3 py-2 text-[13px] text-black" value={variant.multiplier} onChange={(e) => {
                                                                const updated = [...newProduct.variants];
                                                                updated[index].multiplier = parseFloat(e.target.value);
                                                                setNewProduct({...newProduct, variants: updated});
                                                            }} />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <label className="block text-[10px] font-bold text-black uppercase mb-2">Stock</label>
                                                            <input type="number" className="w-full bg-white border border-gray-400 rounded-xl px-3 py-2 text-[13px] text-black" value={variant.stock} onChange={(e) => {
                                                                const updated = [...newProduct.variants];
                                                                updated[index].stock = parseInt(e.target.value);
                                                                setNewProduct({...newProduct, variants: updated});
                                                            }} />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <button type="button" onClick={() => setNewProduct({...newProduct, variants: newProduct.variants.filter((_, i) => i !== index)})} className="p-2 text-red-500">
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="group mt-6">
                                            <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Full Description</label>
                                            <textarea className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-4 text-[14px] text-black min-h-[100px] resize-none" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} placeholder="Description..." />
                                        </div>

                                        <button type="submit" className="mt-8 w-full py-4 bg-black text-white rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] shadow-xl">Confirm Add</button>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Edit Product Modal */}
                    <AnimatePresence>
                        {isEditModalOpen && editingProduct && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                />
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    className="relative bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                                >
                                    <div className="bg-[#064e3b] px-8 py-5 text-white relative overflow-hidden">
                                        <div className="flex justify-between items-center relative z-10">
                                            <h2 className="text-[15px] font-bold font-['Prosto_One'] tracking-[0.3em]">Modify Product</h2>
                                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </div>
                                    <form onSubmit={handleUpdateProduct} className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-6">
                                                <div className="group">
                                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Product Name</label>
                                                    <input required type="text" className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} />
                                                </div>
                                                <div className="group">
                                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Subtitle</label>
                                                    <input required type="text" className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={editingProduct.subtitle} onChange={(e) => setEditingProduct({...editingProduct, subtitle: e.target.value})} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="group">
                                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Price (€)</label>
                                                        <input required type="number" step="0.01" className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] font-bold text-black" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} />
                                                    </div>
                                                    <div className="group">
                                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Base Unit</label>
                                                        <input required type="text" className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={editingProduct.unit} onChange={(e) => {
                                                            const newUnit = e.target.value;
                                                            const updatedVariants = editingProduct.variants.map(v => {
                                                                const autoMultiplier = calculateMultiplier(v.label, newUnit);
                                                                return autoMultiplier !== null ? { ...v, multiplier: autoMultiplier } : v;
                                                            });
                                                            setEditingProduct({...editingProduct, unit: newUnit, variants: updatedVariants});
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="group">
                                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Collection</label>
                                                    <select className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={editingProduct.collection} onChange={(e) => setEditingProduct({...editingProduct, collection: e.target.value})}>
                                                        <option value="Black teas">Black teas</option>
                                                        <option value="Green teas">Green teas</option>
                                                        <option value="White teas">White teas</option>
                                                        <option value="Matcha">Matcha</option>
                                                        <option value="Herbal teas">Herbal teas</option>
                                                        <option value="Chai">Chai</option>
                                                        <option value="Oolong">Oolong</option>
                                                        <option value="Rooibos">Rooibos</option>
                                                        <option value="Teaware">Teaware</option>
                                                    </select>
                                                </div>
                                                <div className="group">
                                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Image URL</label>
                                                    <input required type="text" className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={editingProduct.image} onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="group">
                                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Origin</label>
                                                        <select className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={editingProduct.origin} onChange={(e) => setEditingProduct({...editingProduct, origin: e.target.value})}>
                                                            {originOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="group">
                                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Flavour</label>
                                                        <select className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-3.5 text-[14px] text-black" value={editingProduct.flavour} onChange={(e) => setEditingProduct({...editingProduct, flavour: e.target.value})}>
                                                            {flavourOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-gray-100">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-[14px] font-bold text-black uppercase tracking-widest">Product Variants</h3>
                                                <button type="button" onClick={() => setEditingProduct({...editingProduct, variants: [...(editingProduct.variants || []), { label: '', multiplier: 1, stock: 0 }]})} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
                                                    <Plus size={14} /> Add Variant
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {(editingProduct.variants || []).map((variant, index) => (
                                                    <div key={index} className="grid grid-cols-12 gap-4 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-400">
                                                        <div className="col-span-5">
                                                            <label className="block text-[10px] font-bold text-black uppercase mb-2">Label</label>
                                                            <input type="text" className="w-full bg-white border border-gray-400 rounded-xl px-3 py-2 text-[13px] text-black" value={variant.label} onChange={(e) => {
                                                                const updated = [...editingProduct.variants];
                                                                updated[index].label = e.target.value;
                                                                const autoMultiplier = calculateMultiplier(e.target.value, editingProduct.unit);
                                                                if (autoMultiplier !== null) {
                                                                    updated[index].multiplier = autoMultiplier;
                                                                }
                                                                setEditingProduct({...editingProduct, variants: updated});
                                                            }} placeholder="100 g bag" />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <label className="block text-[10px] font-bold text-black uppercase mb-2">Multiplier</label>
                                                            <input type="number" step="0.1" className="w-full bg-white border border-gray-400 rounded-xl px-3 py-2 text-[13px] text-black" value={variant.multiplier} onChange={(e) => {
                                                                const updated = [...editingProduct.variants];
                                                                updated[index].multiplier = parseFloat(e.target.value);
                                                                setEditingProduct({...editingProduct, variants: updated});
                                                            }} />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <label className="block text-[10px] font-bold text-black uppercase mb-2">Stock</label>
                                                            <input type="number" className="w-full bg-white border border-gray-400 rounded-xl px-3 py-2 text-[13px] text-black" value={variant.stock} onChange={(e) => {
                                                                const updated = [...editingProduct.variants];
                                                                updated[index].stock = parseInt(e.target.value);
                                                                setEditingProduct({...editingProduct, variants: updated});
                                                            }} />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <button type="button" onClick={() => setEditingProduct({...editingProduct, variants: editingProduct.variants.filter((_, i) => i !== index)})} className="p-2 text-red-500">
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="group mt-6">
                                            <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-2">Full Description</label>
                                            <textarea className="w-full bg-gray-50 border border-gray-400 rounded-2xl px-4 py-4 text-[14px] text-black min-h-[100px] resize-none" value={editingProduct.description || ''} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} placeholder="Description..." />
                                        </div>

                                        <button type="submit" className="mt-8 w-full py-4 bg-black text-white rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] shadow-xl">Save Changes</button>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    </div>
);
};

const NavItem = ({ icon, label, isActive, onClick, isCollapsed }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative group ${
            isActive 
            ? 'bg-white/10 text-cyan-400 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]' 
            : 'text-white hover:bg-white/5'
        }`}
    >
        {isActive && (
            <motion.div 
                layoutId="activeAccent"
                className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
            />
        )}
        <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
            {icon}
        </span>
        {!isCollapsed && <span className="text-[14px] font-bold tracking-tight">{label}</span>}
    </button>
);

const StatCard = ({ label, value, icon, color }) => (
    <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white p-4 rounded-2xl border border-gray-400 flex items-center justify-between shadow-sm hover:shadow-xl transition-all duration-300 cursor-default group"
    >
        <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{label}</p>
            <p className="text-[22px] font-medium text-black leading-tight">{value}</p>
        </div>
        <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}
        >
            {React.cloneElement(icon, { size: 24 })}
        </motion.div>
    </motion.div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-orange-100 text-black',
        shipped: 'bg-blue-100 text-black',
        delivered: 'bg-green-100 text-black',
        cancelled: 'bg-red-100 text-black'
    };
    return (
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${styles[status]}`}>
            {status}
        </span>
    );
};

export default AdminDashboard;
