import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Globe, Leaf, Clock, Coffee, Droplets } from 'lucide-react';
import { useCart } from '../context/CartContext';
import API from '../api/axiosConfig';

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart, setNotification } = useCart();
    const [quantity, setQuantity] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState('50 g bag');
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await API.get(`/products/${id}`);
                setProduct(res.data.data);
                
                // Fetch 3 related products
                const relRes = await API.get('/products?limit=3');
                setRelatedProducts(relRes.data.data);
            } catch (err) {
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const variants = [
        { id: 1, label: '50 g bag', multiplier: 1 },
        { id: 2, label: '100 g bag', multiplier: 2 },
        { id: 3, label: '170 g bag', multiplier: 3.4 },
        { id: 4, label: '250 g bag', multiplier: 5 },
        { id: 5, label: '1 kg bag', multiplier: 20 },
        { id: 6, label: 'Sampler', multiplier: 0.5 },
    ];

    if (!product) return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;

    const currentVariants = product.variants && product.variants.length > 0 ? product.variants : variants;
    const currentVariantObj = currentVariants.find(v => v.label === selectedVariant);
    const currentMultiplier = currentVariantObj?.multiplier || 1;
    const currentStock = currentVariantObj?.stock || 0;
    const currentPrice = product.price * currentMultiplier;

    const handleAddToBag = () => {
        if (quantity === 0) {
            setNotification('Please add quantity before adding to bag');
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        if (product && quantity <= currentStock) {
            addToCart(product, quantity, selectedVariant, currentPrice);
            setNotification(`${product.name} (${selectedVariant}) added to bag!`);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen font-['Montserrat'] pb-20 transition-colors duration-300">
            {/* Cart Drawer is now global in App.jsx */}

            {/* Breadcrumbs */}
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                <div className="text-[10px] font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                    <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">HOME</Link>
                    <span>/</span>
                    <Link to="/collections/chai" className="hover:text-black dark:hover:text-white transition-colors">COLLECTIONS CHAI</Link>
                    <span>/</span>
                    <Link to={`/product/${product._id}`} className="hover:text-black dark:hover:text-white text-black dark:text-white">{product.name}</Link>
                </div>
            </div>

            {/* Main Product Info */}
            <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row gap-10 md:gap-16 items-start mb-20">
                {/* Product Image */}
                <div className="w-full md:w-1/2 aspect-square bg-[#F8F8F8] dark:bg-[#111111] overflow-hidden">
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover contrast-[1.02]"
                    />
                </div>

                {/* Product Text Details */}
                <div className="w-full md:w-1/2 space-y-6 md:space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-[28px] sm:text-[36px] md:text-[40px] font-bold leading-tight text-black dark:text-white max-w-md font-['Prosto_One'] uppercase">
                            {product.name}
                        </h1>
                        <p className="text-[14px] text-gray-600 dark:text-white font-medium">
                            {product.description || "A premium tea experience."}
                        </p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-4 sm:gap-8 py-2">
                        <Badge icon={<Globe size={18} strokeWidth={1.5} />} text={`Origin: ${product.origin}`} />
                        {product.isOrganic && <Badge icon={<ShoppingBag size={18} strokeWidth={1.5} />} text="Organic" />}
                        <Badge icon={<Leaf size={18} strokeWidth={1.5} />} text="Vegan" />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-[28px] md:text-[32px] font-bold text-black dark:text-white font-['Prosto_One']">
                            €{currentPrice.toFixed(2)}
                        </div>
                        {(() => {
                            const totalStockAcrossVariants = currentVariants.reduce((acc, v) => acc + (v.stock || 0), 0);
                            const isInStock = totalStockAcrossVariants > 0;
                            return (
                                <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${isInStock ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                                    {isInStock ? 'Stock available' : 'Out of stock'}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Variants */}
                    <div className="space-y-4 overflow-hidden">
                        <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Variants</span>
                        <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {(product.variants && product.variants.length > 0 ? product.variants : variants).map((v, index) => {
                                const isOutOfStock = v.stock === 0;
                                return (
                                    <div 
                                        key={v.label || index}
                                        onClick={() => !isOutOfStock && setSelectedVariant(v.label)}
                                        className={`relative flex flex-col items-center justify-between p-3 border transition-all w-[85px] h-[110px] shrink-0 overflow-hidden ${
                                            isOutOfStock 
                                                ? 'cursor-not-allowed bg-gray-50 dark:bg-[#111] border-gray-100 dark:border-gray-800' 
                                                : selectedVariant === v.label 
                                                    ? 'border-black dark:border-white bg-gray-50 dark:bg-[#1A1A1A] cursor-pointer' 
                                                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
                                        }`}
                                    >
                                        <div className={`flex flex-col items-center justify-between h-full w-full ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}>
                                            <div className="h-14 flex items-end justify-center mt-2">
                                                <BagIcon label={v.label} />
                                            </div>
                                            <span className="text-[10px] font-bold text-black dark:text-white text-center mt-2">{v.label}</span>
                                        </div>
                                        {isOutOfStock && (
                                            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-20 pointer-events-none">
                                                <div className="absolute top-3 -right-5 w-[70px] bg-red-600 text-white text-[6.5px] font-bold py-1 rotate-45 text-center uppercase tracking-tighter shadow-sm">
                                                    Out of Stock
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quantity and Add to Bag */}
                    <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 sm:gap-6 pt-4">
                        <div className="flex items-center justify-between sm:justify-center border border-gray-200 dark:border-gray-800 h-14 rounded-sm">
                            <button 
                                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                                className="px-5 h-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                            >
                                <Minus size={20} className="text-black dark:text-white" />
                            </button>
                            <span className="w-12 text-center font-bold text-[18px] text-black dark:text-white">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(quantity + 1)}
                                disabled={quantity >= currentStock}
                                className={`px-5 h-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center ${quantity >= currentStock ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                <Plus size={20} className="text-black dark:text-white" />
                            </button>
                        </div>
                        <button 
                            onClick={handleAddToBag}
                            disabled={quantity === 0 || quantity > currentStock}
                            className={`flex-grow h-14 bg-black dark:bg-[#1A1A1A] text-white font-bold tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#222] dark:hover:bg-[#2A2A2A] transition-all uppercase text-[13px] shadow-sm ${(quantity === 0 || quantity > currentStock) ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                            <ShoppingBag size={20} />
                            {quantity > currentStock ? 'Out of limit' : 'Add to bag'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Steeping & About Section */}
            <div className="bg-[#F8F8F8] dark:bg-[#0D0D0D] py-16 md:py-20 transition-colors duration-300">
                <div className="container mx-auto px-6 max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20">
                    {/* Steeping Instructions */}
                    <div className="space-y-6">
                        <h2 className="text-[28px] md:text-[32px] font-medium text-black dark:text-white mb-6 md:mb-10 font-['Montserrat']">Steeping instructions</h2>
                        <div className="space-y-6 md:space-y-8">
                            <InstructionItem icon={<Coffee size={24} strokeWidth={1.5}/>} label="SERVING SIZE" value="2 tsp per cup, 6 tsp per pot" />
                            <InstructionItem icon={<Droplets size={24} strokeWidth={1.5}/>} label="WATER TEMPERATURE" value="100°C" />
                            <InstructionItem icon={<Clock size={24} strokeWidth={1.5}/>} label="STEEPING TIME" value="3 - 5 minutes" />
                            
                            <div className="flex items-center gap-6">
                                <div className="w-8 h-8 rounded-full bg-[#B45F5F] shrink-0"></div>
                                <div className="flex-grow">
                                    <span className="text-[13px] font-bold text-black dark:text-white uppercase">COLOR AFTER 3 MINUTES</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About This Tea */}
                    <div className="space-y-10 md:space-y-12">
                        <h2 className="text-[28px] md:text-[32px] font-medium text-black dark:text-white mb-6 md:mb-10 font-['Montserrat']">About this tea</h2>
                        <div className="flex flex-col sm:flex-row items-stretch border-b border-gray-200 dark:border-gray-800 pb-12 gap-6 sm:gap-0">
                            <AboutItem label="FLAVOR" value={product.flavour} showDivider={true} />
                            <AboutItem label="QUALITIES" value={product.quality} showDivider={true} />
                            <AboutItem label="CAFFEINE" value={product.caffeine} showDivider={true} />
                            <AboutItem label="ALLERGENS" value={product.allergen} showDivider={false} />
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-[24px] md:text-[32px] font-medium text-black dark:text-white font-['Montserrat']">Ingredient</h3>
                            <p className="text-[14px] leading-relaxed text-gray-500 dark:text-white max-w-xl font-medium">
                                Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="py-20">
                <div className="container mx-auto px-6 max-w-7xl">
                    <h2 className="text-[28px] md:text-[32px] font-bold text-center mb-16 text-black dark:text-white">You may also like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {relatedProducts.map((p) => (
                            <div 
                                key={p._id} 
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="w-full aspect-square overflow-hidden mb-6 bg-[#F8F8F8] dark:bg-[#111111]">
                                    <img 
                                        src={p.image} 
                                        alt={p.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 contrast-[1.05]"
                                    />
                                </div>
                                <h3 className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-1 tracking-[0.1em] uppercase">{p.name}</h3>
                                <p className="text-[14px] font-bold mb-1.5 tracking-tight text-[#1A1A1A] dark:text-white leading-tight">{p.subtitle}</p>
                                <span className="text-[12px] font-bold text-black dark:text-white">€{p.price.toFixed(2)} {p.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Badge = ({ icon, text }) => (
    <div className="flex items-center gap-2 text-[12px] font-bold tracking-wider text-black dark:text-white">
        {icon}
        <span>{text}</span>
    </div>
);

const BagIcon = ({ label }) => {
    if (label === '50 g bag') return (
        <svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
            <path d="M2 10C2 8.89543 2.89543 8 4 8H20C21.1046 8 22 8.89543 22 10V32H2V10Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 8L6 2H18L20 8" stroke="currentColor" strokeWidth="1.5"/>
            <text x="12" y="24" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">50</text>
        </svg>
    );
    if (label === '100 g bag') return (
        <svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
            <path d="M2 12C2 10.8954 2.89543 10 4 10H24C25.1046 10 26 10.8954 26 12V36H2V12Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 10L7 2H21L24 10" stroke="currentColor" strokeWidth="1.5"/>
            <text x="14" y="26" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">100</text>
        </svg>
    );
    if (label === '170 g bag') return (
        <svg width="26" height="40" viewBox="0 0 26 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
            <rect x="2" y="2" width="22" height="36" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="2" y1="10" x2="24" y2="10" stroke="currentColor" strokeWidth="1.5"/>
            <text x="13" y="26" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">170</text>
        </svg>
    );
    if (label === '250 g bag') return (
        <svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
            <path d="M2 10C2 8.89543 2.89543 8 4 8H26C27.1046 8 28 8.89543 28 10V40H2V10Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 8L8 2H22L26 8" stroke="currentColor" strokeWidth="1.5"/>
            <text x="15" y="28" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">250</text>
        </svg>
    );
    if (label === '1 kg bag') return (
        <svg width="34" height="46" viewBox="0 0 34 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
            <path d="M4 12C4 10.8954 4.89543 10 6 10H28C29.1046 10 30 10.8954 30 12V44H4V12Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 10L10 2H24L28 10" stroke="currentColor" strokeWidth="1.5"/>
            <text x="17" y="30" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">1 kg</text>
        </svg>
    );
    return (
        <svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
            <path d="M4 2H16L20 6V32H4V2Z" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="10" cy="8" r="1.5" fill="currentColor"/>
            <path d="M10 8L22 2" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
            <text x="12" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">S</text>
        </svg>
    );
};

const InstructionItem = ({ icon, label, value }) => (
    <div className="space-y-3">
        <div className="flex items-center gap-4 md:gap-6">
            <div className="text-black dark:text-white shrink-0 w-8 flex justify-center">{icon}</div>
            <div className="text-[12px] md:text-[13px] text-black dark:text-white tracking-tight">
                <span className="font-bold uppercase">{label}:</span> <span className="text-gray-600 dark:text-gray-200 ml-1 font-medium">{value}</span>
            </div>
        </div>
        <div className="ml-12 md:ml-14 border-b border-gray-300 dark:border-gray-800 max-w-[320px]"></div>
    </div>
);

const AboutItem = ({ label, value, showDivider }) => (
    <div className="flex-1 flex flex-col items-center justify-center relative px-2 text-center py-4 sm:py-0">
        <span className="text-[11px] md:text-[12px] font-bold text-black dark:text-white uppercase tracking-widest mb-2 md:mb-3">{label}</span>
        <span className="text-[13px] md:text-[14px] font-medium text-gray-500 dark:text-gray-400">{value}</span>
        {showDivider && (
            <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-gray-300 dark:bg-gray-800"></div>
        )}
    </div>
);

export default ProductDetail;
