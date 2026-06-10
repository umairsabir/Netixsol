import React, { useState, useEffect } from 'react';
import { X, Clock, ShoppingBag, Package, ChevronRight, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axiosConfig';

const OrderHistoryModal = ({ isOpen, onClose }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        } else {
            setExpandedOrderId(null);
        }
    }, [isOpen]);

    const fetchOrders = async () => {
        try {
            const res = await API.get('/orders/my-orders');
            setOrders(res.data.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedOrderId(expandedOrderId === id ? null : id);
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        
        setCancellingId(orderId);
        try {
            await API.patch(`/orders/${orderId}/cancel`);
            // Refresh orders
            fetchOrders();
        } catch (err) {
            console.error('Error cancelling order:', err);
            alert(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-orange-100 text-orange-700 border-orange-200',
            shipped: 'bg-blue-100 text-blue-700 border-blue-200',
            delivered: 'bg-green-100 text-green-700 border-green-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200'
        };
        return styles[status] || styles.pending;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="bg-[#064e3b] px-8 py-6 text-white relative">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={24} className="text-emerald-400" />
                                <h2 className="text-[18px] font-bold font-['Prosto_One'] tracking-wider">MY ORDER HISTORY</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Loading your orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Package size={32} className="text-gray-300" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[16px] font-bold text-black">No orders found yet</p>
                                    <p className="text-[12px] text-gray-400 max-w-[250px]">Once you place an order, it will appear here for you to track.</p>
                                </div>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <motion.div 
                                    key={order._id}
                                    layout
                                    className={`border rounded-2xl overflow-hidden transition-all duration-500 ${
                                        expandedOrderId === order._id 
                                        ? 'bg-gray-50 border-emerald-300 shadow-xl scale-[1.01] ring-1 ring-emerald-100' 
                                        : 'bg-white border-gray-200 shadow-sm'
                                    }`}
                                >
                                    {/* Order Summary Header (Always Visible) */}
                                    <button 
                                        onClick={() => toggleExpand(order._id)}
                                        className={`w-full p-5 flex items-center justify-between text-left transition-colors ${
                                            expandedOrderId === order._id ? 'bg-emerald-50/50' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                                                <p className="text-[14px] font-bold text-black font-mono">#{order._id.slice(-8)}</p>
                                            </div>
                                            <div className="h-8 w-[1px] bg-gray-100 hidden sm:block"></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                                <p className="text-[13px] font-bold text-black">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <motion.div
                                                animate={{ rotate: expandedOrderId === order._id ? 180 : 0 }}
                                                className="text-gray-400"
                                            >
                                                <ChevronDown size={20} />
                                            </motion.div>
                                        </div>
                                    </button>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedOrderId === order._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden border-t border-gray-50 bg-gray-50/30"
                                            >
                                                <div className="p-5 space-y-5">
                                                    <div className="space-y-3">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between items-center py-2 border-b border-white last:border-0">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
                                                                        {item.image ? (
                                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <Package size={20} className="text-gray-300" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[13px] font-bold text-black">{item.name}</p>
                                                                        <p className="text-[11px] text-gray-400 uppercase tracking-wider">{item.selectedVariant} x {item.quantity}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-[13px] font-bold text-black">€{(item.price * item.quantity).toFixed(2)}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex justify-between items-end pt-4 border-t border-white">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Total Amount</p>
                                                            <p className="text-[20px] font-bold text-black">€{order.totalPrice.toFixed(2)}</p>
                                                        </div>
                                                        
                                                        {order.status === 'pending' && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCancelOrder(order._id);
                                                                }}
                                                                disabled={cancellingId === order._id}
                                                                className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
                                                            >
                                                                {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OrderHistoryModal;
