import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, updateQuantity, cartSubtotal, deliveryFee, cartTotal } = useCart();
    const { user } = useAuth();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white dark:bg-[#0A0A0A] shadow-2xl flex flex-col transition-colors duration-300">
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShoppingBag size={24} className="text-black dark:text-white" />
                            <h2 className="text-[18px] font-bold text-black dark:text-white uppercase tracking-widest font-['Montserrat']">My bag</h2>
                            <span className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <X size={24} className="text-black dark:text-white" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <div key={`${item._id}-${item.selectedVariant}`} className="flex gap-6">
                                    <div className="w-24 h-24 bg-[#F8F8F8] dark:bg-[#111111] shrink-0 overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-[14px] font-bold text-black dark:text-white leading-tight max-w-[160px]">
                                                    {item.name} <span className="text-gray-400 font-medium">({item.selectedVariant})</span>
                                                </h3>
                                            </div>
                                            <span className="text-[16px] font-bold text-black dark:text-white">€{item.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-5">
                                                <button 
                                                    onClick={() => updateQuantity(item._id, -1, item.selectedVariant)}
                                                    className="text-black dark:text-white hover:opacity-60"
                                                >
                                                    <Minus size={18} />
                                                </button>
                                                <span className="text-[16px] font-bold text-black dark:text-white w-4 text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item._id, 1, item.selectedVariant)}
                                                    className="text-black dark:text-white hover:opacity-60"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => updateQuantity(item._id, -item.quantity, item.selectedVariant)}
                                                className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors"
                                            >
                                                REMOVE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 space-y-4">
                                <ShoppingBag size={48} strokeWidth={1} />
                                <p className="font-medium">Your bag is empty</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-8 bg-[#F8F8F8] dark:bg-[#0D0D0D] space-y-6 transition-colors duration-300">
                        <div className="space-y-3">
                            <div className="flex justify-between text-[14px] font-medium">
                                <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtotal</span>
                                <span className="text-black dark:text-white font-bold">€{cartSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[14px] font-medium">
                                <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivery</span>
                                <span className="text-black dark:text-white font-bold">€{deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-300 dark:border-gray-800 pt-4 flex justify-between items-center">
                                <span className="text-[16px] font-bold text-black dark:text-white uppercase tracking-widest">Total</span>
                                <span className="text-[24px] font-bold text-black dark:text-white font-['Prosto_One']">€{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => {
                                    if (!user) {
                                        const proceed = window.confirm("Please login first to proceed with purchase.");
                                        onClose();
                                        if (proceed) {
                                            navigate('/login', { state: { from: location.pathname, cartOpen: true } });
                                        } else {
                                            navigate('/');
                                        }
                                    } else {
                                        onClose();
                                        navigate('/cart');
                                    }
                                }}
                                className="w-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold tracking-[0.2em] flex items-center justify-center hover:bg-[#222] dark:hover:bg-gray-200 transition-all uppercase text-[13px]"
                            >
                                PURCHASE
                            </button>
                            <button 
                                onClick={onClose}
                                className="w-full h-14 border border-gray-300 dark:border-gray-800 text-black dark:text-white font-bold tracking-[0.2em] flex items-center justify-center hover:bg-white/50 dark:hover:bg-[#111] transition-all uppercase text-[13px]"
                            >
                                BACK TO SHOPPING
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
