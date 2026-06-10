import React, { useState } from 'react';
import { Minus, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../api/axiosConfig';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, clearCart, cartSubtotal, deliveryFee, cartTotal } = useCart();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('MY_BAG'); // 'MY_BAG' or 'DELIVERY'
    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const tempErrors = {};
        if (!shippingAddress.name.trim()) tempErrors.name = "Name is required";
        if (!shippingAddress.email.trim()) {
            tempErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) {
            tempErrors.email = "Invalid email format";
        }
        if (!shippingAddress.address.trim()) tempErrors.address = "Address is required";
        if (!shippingAddress.city.trim()) tempErrors.city = "City is required";
        if (!shippingAddress.postalCode.trim()) tempErrors.postalCode = "Postal code is required";
        if (!shippingAddress.country.trim()) tempErrors.country = "Country is required";
        
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        
        if (step === 'MY_BAG') {
            setStep('DELIVERY');
            return;
        }

        // step === 'DELIVERY'
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Mapping cart items to the format expected by the backend
            const orderData = {
                items: cartItems.map(item => ({
                    product: item._id,
                    name: item.name,
                    image: item.image,
                    quantity: item.quantity,
                    selectedVariant: item.selectedVariant,
                    price: item.price
                })),
                totalPrice: cartTotal,
                shippingAddress: shippingAddress
            };

            await API.post('/orders', orderData);
            
            alert("Order placed successfully! Thank you for shopping with SR TEA.");
            clearCart();
            navigate('/collections/chai');
        } catch (err) {
            console.error('Checkout error:', err);
            alert(err.response?.data?.message || "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen font-['Montserrat'] pb-20 transition-colors duration-300">
            {/* Checkout Stepper Section */}
            <div className="container mx-auto px-6 pt-0 pb-12 max-w-7xl">
                <div className="flex items-center justify-between gap-4 py-6 border-b border-gray-100 dark:border-gray-800 mb-8">
                    <span className={`text-[12px] md:text-[14px] uppercase tracking-[0.15em] shrink-0 ${
                        step === 'MY_BAG' 
                            ? 'font-bold text-black dark:text-white' 
                            : 'font-medium text-gray-400 dark:text-gray-500'
                    }`}>
                        1. MY BAG
                    </span>
                    <div className="h-[1px] flex-grow bg-black dark:bg-white mx-4 md:mx-10 shrink-0 opacity-20"></div>
                    <span className={`text-[12px] md:text-[14px] uppercase tracking-[0.15em] shrink-0 ${
                        step === 'DELIVERY' 
                            ? 'font-bold text-black dark:text-white' 
                            : 'font-medium text-gray-400 dark:text-gray-500'
                    }`}>
                        DELIVERY
                    </span>
                    <div className="h-[1px] flex-grow bg-black dark:bg-white mx-4 md:mx-10 shrink-0 opacity-20"></div>
                    <span className="text-[12px] md:text-[14px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] shrink-0 text-right">REVIEW & PAYMENT</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 mt-12">
                    {step === 'MY_BAG' ? (
                        /* Left Column: Items */
                        <div className="lg:col-span-6 space-y-6">
                            <div className="space-y-4 min-h-[200px]">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item) => (
                                        <div key={`${item._id}-${item.selectedVariant}`} className="flex gap-6 py-6 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                            <div className="w-20 h-20 bg-[#F8F8F8] dark:bg-[#111111] shrink-0 overflow-hidden">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-4">
                                                        <h3 className="text-[14px] font-medium text-black dark:text-white leading-tight max-w-[220px]">
                                                            {item.name} <span className="text-gray-400 font-normal">({item.selectedVariant})</span>
                                                        </h3>
                                                        <button 
                                                            onClick={() => updateQuantity(item._id, -item.quantity, item.selectedVariant)}
                                                            className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors block"
                                                        >
                                                            REMOVE
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-6">
                                                        <div className="flex items-center gap-6">
                                                            <button 
                                                                onClick={() => updateQuantity(item._id, -1, item.selectedVariant)}
                                                                className="text-black dark:text-white hover:opacity-60"
                                                            >
                                                                <Minus size={18} />
                                                            </button>
                                                            <span className="text-[16px] font-medium text-black dark:text-white w-4 text-center">{item.quantity}</span>
                                                            <button 
                                                                onClick={() => updateQuantity(item._id, 1, item.selectedVariant)}
                                                                disabled={item.quantity >= item.stock}
                                                                className={`text-black dark:text-white hover:opacity-60 ${item.quantity >= item.stock ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                            >
                                                                <Plus size={18} />
                                                            </button>
                                                        </div>
                                                        <span className="text-[14px] font-bold text-black dark:text-white">€{item.price.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center text-gray-400 dark:text-gray-600 font-medium">Your bag is empty</div>
                                )}
                            </div>

                            {/* Subtotal Section */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex justify-between items-center py-6">
                                    <span className="text-[16px] font-medium text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span className="text-[16px] font-bold text-black dark:text-white">€{cartSubtotal.toFixed(2)}</span>
                                </div>

                                <button 
                                    onClick={() => navigate('/collections/chai')}
                                    className="w-full sm:w-[320px] h-14 border border-gray-400 dark:border-gray-800 text-[#333] dark:text-white font-medium tracking-[0.05em] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#111] transition-all uppercase text-[13px] mt-4"
                                >
                                    BACK TO SHOPPING
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Left Column: Premium Shipping Address Form */
                        <div className="lg:col-span-6 space-y-8">
                            <div>
                                <h2 className="text-[20px] md:text-[24px] font-medium text-black dark:text-white mb-8 uppercase tracking-wider font-['Montserrat']">Shipping Details</h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Full Name</label>
                                            <input 
                                                type="text"
                                                value={shippingAddress.name}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                                                className={`w-full h-12 px-4 bg-[#F8F8F8] dark:bg-[#111] border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} text-black dark:text-white text-[13px] font-medium focus:outline-none focus:border-black dark:focus:border-white transition-colors`}
                                                placeholder="John Doe"
                                            />
                                            {errors.name && <p className="text-red-500 text-[11px] font-medium mt-1">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Email Address</label>
                                            <input 
                                                type="email"
                                                value={shippingAddress.email}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                                                className={`w-full h-12 px-4 bg-[#F8F8F8] dark:bg-[#111] border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} text-black dark:text-white text-[13px] font-medium focus:outline-none focus:border-black dark:focus:border-white transition-colors`}
                                                placeholder="john@example.com"
                                            />
                                            {errors.email && <p className="text-red-500 text-[11px] font-medium mt-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Street Address</label>
                                        <input 
                                            type="text"
                                            value={shippingAddress.address}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                                            className={`w-full h-12 px-4 bg-[#F8F8F8] dark:bg-[#111] border ${errors.address ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} text-black dark:text-white text-[13px] font-medium focus:outline-none focus:border-black dark:focus:border-white transition-colors`}
                                            placeholder="123 Main St, Apt 4B"
                                        />
                                        {errors.address && <p className="text-red-500 text-[11px] font-medium mt-1">{errors.address}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">City</label>
                                            <input 
                                                type="text"
                                                value={shippingAddress.city}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                                className={`w-full h-12 px-4 bg-[#F8F8F8] dark:bg-[#111] border ${errors.city ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} text-black dark:text-white text-[13px] font-medium focus:outline-none focus:border-black dark:focus:border-white transition-colors`}
                                                placeholder="Islamabad"
                                            />
                                            {errors.city && <p className="text-red-500 text-[11px] font-medium mt-1">{errors.city}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Postal Code</label>
                                            <input 
                                                type="text"
                                                value={shippingAddress.postalCode}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                                className={`w-full h-12 px-4 bg-[#F8F8F8] dark:bg-[#111] border ${errors.postalCode ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} text-black dark:text-white text-[13px] font-medium focus:outline-none focus:border-black dark:focus:border-white transition-colors`}
                                                placeholder="44000"
                                            />
                                            {errors.postalCode && <p className="text-red-500 text-[11px] font-medium mt-1">{errors.postalCode}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Country</label>
                                            <input 
                                                type="text"
                                                value={shippingAddress.country}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                                className={`w-full h-12 px-4 bg-[#F8F8F8] dark:bg-[#111] border ${errors.country ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} text-black dark:text-white text-[13px] font-medium focus:outline-none focus:border-black dark:focus:border-white transition-colors`}
                                                placeholder="Pakistan"
                                            />
                                            {errors.country && <p className="text-red-500 text-[11px] font-medium mt-1">{errors.country}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                <button 
                                    onClick={() => setStep('MY_BAG')}
                                    className="w-full sm:w-[320px] h-14 border border-gray-400 dark:border-gray-800 text-[#333] dark:text-white font-medium tracking-[0.05em] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#111] transition-all uppercase text-[13px] mt-4"
                                >
                                    BACK TO BAG
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Right Column: Summary & Info */}
                    <div className="lg:col-span-6 space-y-8">
                        {/* Order Summary */}
                        <div className="bg-[#F8F8F8] dark:bg-[#111111] p-8 space-y-8 transition-colors duration-300">
                            <h2 className="text-[24px] font-medium text-black dark:text-white font-['Montserrat']">Order summery</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[14px] font-medium">
                                    <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtotal</span>
                                    <span className="text-black dark:text-white font-bold">€{cartSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[14px] font-medium">
                                    <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivery</span>
                                    <span className="text-black dark:text-white font-bold">€{deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-300 dark:border-gray-800 pt-6 flex justify-between items-center">
                                    <span className="text-[16px] font-bold text-black dark:text-white uppercase tracking-widest">Total</span>
                                    <span className="text-[24px] font-bold text-black dark:text-white font-['Prosto_One']">€{cartTotal.toFixed(2)}</span>
                                </div>
                                <p className="text-[12px] text-gray-400 dark:text-gray-500 font-medium pt-2">Estimated shipping time: 2 days</p>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                disabled={loading}
                                className={`w-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold tracking-[0.2em] flex items-center justify-center hover:bg-[#222] dark:hover:bg-gray-200 transition-all uppercase text-[13px] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : step === 'MY_BAG' ? 'Check out' : 'Confirm'}
                            </button>
                        </div>

                        {/* Payment Type */}
                        <div className="bg-[#F8F8F8] dark:bg-[#111111] p-8 space-y-6">
                            <h3 className="text-[16px] font-bold text-black dark:text-white uppercase tracking-widest">Payment type</h3>
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-white text-[10px] font-bold">VISA</div>
                                <div className="w-12 h-8 bg-orange-600 rounded flex items-center justify-center text-white text-[10px] font-bold">MC</div>
                                <div className="w-12 h-8 bg-blue-700 rounded flex items-center justify-center text-white text-[10px] font-bold">PP</div>
                                <div className="w-12 h-8 bg-pink-500 rounded flex items-center justify-center text-white text-[10px] font-bold">Kl</div>
                                <div className="w-12 h-8 bg-black rounded flex items-center justify-center text-white text-[10px] font-bold italic">Pay</div>
                            </div>
                        </div>

                        {/* Delivery and Retour */}
                        <div className="bg-[#F8F8F8] dark:bg-[#111111] p-8 space-y-6">
                            <h3 className="text-[16px] font-bold text-black dark:text-white uppercase tracking-widest">Delivery and retour</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                                    <ChevronRight size={16} className="text-black dark:text-white shrink-0 mt-0.5" />
                                    <span>Order before 12:00 and we will ship the same day.</span>
                                </li>
                                <li className="flex items-start gap-3 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                                    <ChevronRight size={16} className="text-black dark:text-white shrink-0 mt-0.5" />
                                    <span>Orders made after Friday 12:00 are processed on Monday.</span>
                                </li>
                                <li className="flex items-start gap-3 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                                    <ChevronRight size={16} className="text-black dark:text-white shrink-0 mt-0.5" />
                                    <span>To return your articles, please contact us first.</span>
                                </li>
                                <li className="flex items-start gap-3 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                                    <ChevronRight size={16} className="text-black dark:text-white shrink-0 mt-0.5" />
                                    <span>Postal charges for retour are not reimbursed.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular this season Section */}
            <div className="py-20 border-t border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-6 max-w-7xl">
                    <h2 className="text-[32px] font-bold text-center mb-16 font-['Prosto_One'] text-black dark:text-white">Popular this season</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                        {[
                            { id: 1, name: "Assam Black", subtitle: "Strong breakfast tea", price: 3.50, image: "/images/Image Holder.png" },
                            { id: 2, name: "White Peony", subtitle: "Delicate white tea", price: 6.20, image: "/images/Image Holder (1).png" },
                            { id: 3, name: "Matcha Premium", subtitle: "Ceremonial grade", price: 12.99, image: "/images/Image Holder (2).png" }
                        ].map((product) => (
                            <div key={product.id} className="flex flex-col items-center text-center group cursor-pointer">
                                <div className="w-full aspect-square overflow-hidden mb-6 bg-[#F8F8F8] dark:bg-[#111111]">
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-1 tracking-[0.1em] uppercase">{product.name}</h3>
                                <p className="text-[14px] font-bold mb-1.5 tracking-tight text-[#1A1A1A] dark:text-white">{product.subtitle}</p>
                                <span className="text-[12px] font-bold text-black dark:text-white">€{product.price.toFixed(2)} / 50 g</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
