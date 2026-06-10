import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import API from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openFilter, setOpenFilter] = useState('');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Newest First');
    const [isOrganicOnly, setIsOrganicOnly] = useState(false);
    
    // State for dynamic counts
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [selectedOrigins, setSelectedOrigins] = useState([]);
    const [selectedFlavours, setSelectedFlavours] = useState([]);
    const [selectedQualities, setSelectedQualities] = useState([]);
    const [selectedCaffeine, setSelectedCaffeine] = useState([]);
    const [selectedAllergens, setSelectedAllergens] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 9;

    useEffect(() => {
        // Reset to page 1 when filters change
        setCurrentPage(1);
    }, [isOrganicOnly, selectedCollections, selectedOrigins, selectedFlavours, selectedQualities, selectedCaffeine, selectedAllergens, sortBy]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: currentPage,
                    limit: limit,
                    sort: sortBy,
                    isOrganic: isOrganicOnly
                });

                if (selectedCollections.length > 0) params.append('collectionName', selectedCollections.join(','));
                if (selectedOrigins.length > 0) params.append('origin', selectedOrigins.join(','));
                if (selectedFlavours.length > 0) params.append('flavour', selectedFlavours.join(','));
                if (selectedQualities.length > 0) params.append('quality', selectedQualities.join(','));
                if (selectedCaffeine.length > 0) params.append('caffeine', selectedCaffeine.join(','));
                if (selectedAllergens.length > 0) params.append('allergen', selectedAllergens.join(','));

                const res = await API.get(`/products?${params.toString()}`);
                setProducts(res.data.data);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [currentPage, isOrganicOnly, selectedCollections, selectedOrigins, selectedFlavours, selectedQualities, selectedCaffeine, selectedAllergens, sortBy]);

    const filteredAndSortedProducts = useMemo(() => {
        return products;
    }, [products]);

    const collectionOptions = ["Black teas", "Green teas", "White teas", "Chai", "Matcha", "Herbal teas", "Oolong", "Rooibos", "Teaware"];
    const originOptions = ["India", "Japan", "Iran", "South Africa"];
    const flavourOptions = ["Spicy", "Sweet", "Citrus", "Smooth", "Fruity", "Floral", "Grassy", "Minty", "Bitter", "Creamy"];
    const qualityOptions = ["Detox", "Energy", "Relax", "Digestion"];
    const caffeineOptions = ["No Caffeine", "Low Caffeine", "Medium Caffeine", "High Caffeine"];
    const allergenOptions = ["Lactose-free", "Gluten-free", "Nuts-free", "Soy-free"];

    const toggleFilter = (option, selectedList, setSelectedList) => {
        if (selectedList.includes(option)) {
            setSelectedList(selectedList.filter(item => item !== option));
        } else {
            setSelectedList([...selectedList, option]);
        }
    };

    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen font-['Montserrat'] transition-colors duration-300">
            {/* Banner */}
            <div className="w-full h-[300px] md:h-[400px] overflow-hidden">
                <img 
                    src="/images/Rectangle 2.png" 
                    className="w-full h-full object-cover"
                    alt="Tea Banner"
                />
            </div>

            <div className="container mx-auto px-6 py-10 max-w-7xl">
                {/* Breadcrumbs */}
                <div className="text-[10px] font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-12 flex items-center gap-2">
                    <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">HOME</Link>
                    <span>/</span>
                    <Link to="/collections/chai" className="hover:text-black dark:hover:text-white text-black dark:text-white">COLLECTIONS CHAI</Link>
                </div>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Sidebar Filters */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="space-y-4">
                            {/* COLLECTIONS FILTER */}
                            <FilterItem 
                                title={<>COLLECTIONS <span className="text-gray-400 ml-1">({collectionOptions.length})</span></>} 
                                isOpen={openFilter === 'collection'} 
                                onClick={() => setOpenFilter(openFilter === 'collection' ? '' : 'collection')} 
                            >
                                <div className="space-y-3 pl-1">
                                    {collectionOptions.map((option) => (
                                        <label key={option} className="flex items-center gap-3 group cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 border-gray-300 dark:border-gray-700 rounded cursor-pointer accent-black dark:accent-white" 
                                                checked={selectedCollections.includes(option)}
                                                onChange={() => toggleFilter(option, selectedCollections, setSelectedCollections)}
                                            />
                                            <span className={`text-[12px] transition-colors ${selectedCollections.includes(option) ? 'text-black dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}>
                                                {option}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FilterItem>

                            {/* ORIGIN FILTER */}
                            <FilterItem 
                                title={<>ORIGIN <span className="text-gray-400 ml-1">({originOptions.length})</span></>} 
                                isOpen={openFilter === 'origin'} 
                                onClick={() => setOpenFilter(openFilter === 'origin' ? '' : 'origin')} 
                            >
                                <div className="space-y-3 pl-1">
                                    {originOptions.map((option) => (
                                        <label key={option} className="flex items-center gap-3 group cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 border-gray-300 dark:border-gray-700 rounded cursor-pointer accent-black dark:accent-white" 
                                                checked={selectedOrigins.includes(option)}
                                                onChange={() => toggleFilter(option, selectedOrigins, setSelectedOrigins)}
                                            />
                                            <span className={`text-[12px] transition-colors ${selectedOrigins.includes(option) ? 'text-black dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}>
                                                {option}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FilterItem>

                            {/* FLAVOUR FILTER */}
                            <FilterItem 
                                title={<>FLAVOUR <span className="text-gray-400 ml-1">({flavourOptions.length})</span></>} 
                                isOpen={openFilter === 'flavour'} 
                                onClick={() => setOpenFilter(openFilter === 'flavour' ? '' : 'flavour')} 
                            >
                                <div className="space-y-3 pl-1">
                                    {flavourOptions.map((option) => (
                                        <label key={option} className="flex items-center gap-3 group cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 border-gray-300 dark:border-gray-700 rounded cursor-pointer accent-black dark:accent-white" 
                                                checked={selectedFlavours.includes(option)}
                                                onChange={() => toggleFilter(option, selectedFlavours, setSelectedFlavours)}
                                            />
                                            <span className={`text-[12px] transition-colors ${selectedFlavours.includes(option) ? 'text-black dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}>
                                                {option}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FilterItem>

                            {/* QUALITIES FILTER */}
                            <FilterItem 
                                title={<>QUALITIES <span className="text-gray-400 ml-1">({qualityOptions.length})</span></>} 
                                isOpen={openFilter === 'qualities'} 
                                onClick={() => setOpenFilter(openFilter === 'qualities' ? '' : 'qualities')} 
                            >
                                <div className="space-y-3 pl-1">
                                    {qualityOptions.map((option) => (
                                        <label key={option} className="flex items-center gap-3 group cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 border-gray-300 dark:border-gray-700 rounded cursor-pointer accent-black dark:accent-white" 
                                                checked={selectedQualities.includes(option)}
                                                onChange={() => toggleFilter(option, selectedQualities, setSelectedQualities)}
                                            />
                                            <span className={`text-[12px] transition-colors ${selectedQualities.includes(option) ? 'text-black dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}>
                                                {option}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FilterItem>

                            {/* CAFEINE FILTER */}
                            <FilterItem 
                                title={<>CAFEINE <span className="text-gray-400 ml-1">({caffeineOptions.length})</span></>} 
                                isOpen={openFilter === 'cafeine'} 
                                onClick={() => setOpenFilter(openFilter === 'cafeine' ? '' : 'cafeine')} 
                            >
                                <div className="space-y-3 pl-1">
                                    {caffeineOptions.map((option) => (
                                        <label key={option} className="flex items-center gap-3 group cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 border-gray-300 dark:border-gray-700 rounded cursor-pointer accent-black dark:accent-white" 
                                                checked={selectedCaffeine.includes(option)}
                                                onChange={() => toggleFilter(option, selectedCaffeine, setSelectedCaffeine)}
                                            />
                                            <span className={`text-[12px] transition-colors ${selectedCaffeine.includes(option) ? 'text-black dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}>
                                                {option}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FilterItem>

                            {/* ALLERGENS FILTER */}
                            <FilterItem 
                                title={<>ALLERGENS <span className="text-gray-400 ml-1">({allergenOptions.length})</span></>} 
                                isOpen={openFilter === 'allergens'} 
                                onClick={() => setOpenFilter(openFilter === 'allergens' ? '' : 'allergens')} 
                            >
                                <div className="space-y-3 pl-1">
                                    {allergenOptions.map((option) => (
                                        <label key={option} className="flex items-center gap-3 group cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 border-gray-300 dark:border-gray-700 rounded cursor-pointer accent-black dark:accent-white" 
                                                checked={selectedAllergens.includes(option)}
                                                onChange={() => toggleFilter(option, selectedAllergens, setSelectedAllergens)}
                                            />
                                            <span className={`text-[12px] transition-colors ${selectedAllergens.includes(option) ? 'text-black dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}>
                                                {option}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </FilterItem>
                            
                            <div className="pt-6 flex items-center justify-between">
                                <span className="text-[13px] font-bold tracking-widest uppercase text-[#444] dark:text-gray-300">ORGANIC</span>
                                <div 
                                    className={`w-10 h-5 border border-black dark:border-white rounded-full relative cursor-pointer transition-colors duration-300 ${isOrganicOnly ? 'bg-black dark:bg-white' : 'bg-transparent'}`}
                                    onClick={() => setIsOrganicOnly(!isOrganicOnly)}
                                >
                                    <div className={`w-3 h-3 rounded-full absolute top-1 transition-all duration-300 ${isOrganicOnly ? 'right-1 bg-white dark:bg-black' : 'left-1 bg-black dark:bg-white'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-grow">
                        {/* Sort By Header */}
                        <div className="flex justify-end mb-8 relative">
                            <div 
                                className="flex items-center gap-1.5 cursor-pointer group"
                                onClick={() => setIsSortOpen(!isSortOpen)}
                            >
                                <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-black dark:text-white">SORT BY</span>
                                <div className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}>
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white" />
                                    </svg>
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            {isSortOpen && (
                                <div className="absolute top-8 right-0 bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 shadow-xl z-20 w-56 py-2 animate-fadeIn">
                                    {['Newest First', 'Price: Low to High', 'Price: High to Low', 'Name: A to Z'].map((option) => (
                                        <div 
                                            key={option} 
                                            className={`px-4 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-50 dark:hover:bg-[#1A1A1A] cursor-pointer transition-colors ${sortBy === option ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
                                            onClick={() => {
                                                setSortBy(option);
                                                setIsSortOpen(false);
                                            }}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Grid */}
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div 
                                    key="skeleton"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                        <div key={n} className="flex flex-col items-center animate-pulse">
                                            <div className="w-full aspect-square bg-gray-100 dark:bg-[#111111] mb-6"></div>
                                            <div className="h-2 w-20 bg-gray-100 dark:bg-[#111111] mb-2"></div>
                                            <div className="h-4 w-40 bg-gray-100 dark:bg-[#111111] mb-2"></div>
                                            <div className="h-3 w-24 bg-gray-100 dark:bg-[#111111]"></div>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key={`page-${currentPage}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
                                >
                                    {filteredAndSortedProducts.map((product) => (
                                        <Link 
                                            to={`/product/${product._id}`} 
                                            key={product._id} 
                                            className="flex flex-col items-center text-center group cursor-pointer"
                                        >
                                            <div className="w-full aspect-square overflow-hidden mb-6 bg-[#F8F8F8] dark:bg-[#111111]">
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 contrast-[1.05]"
                                                />
                                            </div>
                                            <h3 className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-1 tracking-[0.1em] uppercase">{product.name}</h3>
                                            <p className="text-[14px] font-bold mb-1.5 tracking-tight text-[#1A1A1A] dark:text-white leading-tight">{product.subtitle}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-bold text-black dark:text-white">€{product.price.toFixed(2)} {product.unit}</span>
                                                {product.isOrganic && <span className="text-[9px] bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Organic</span>}
                                            </div>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {!loading && filteredAndSortedProducts.length === 0 && (
                            <div className="text-center py-20 text-gray-400">No products found matching your filters.</div>
                        )}

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => {
                                            setCurrentPage(pageNum);
                                        }}
                                        className={`w-10 h-10 rounded-full text-[12px] font-bold transition-all duration-300 ${
                                            currentPage === pageNum 
                                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' 
                                            : 'bg-white dark:bg-[#111111] text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FilterItem = ({ title, isOpen, onClick, children }) => (
    <div className="py-2">
        <div className="flex items-center justify-between cursor-pointer py-1" onClick={onClick}>
            <span className="text-[13px] font-bold tracking-widest uppercase text-[#444] dark:text-gray-300">
                {title}
            </span>
            {isOpen ? (
                <Minus size={16} strokeWidth={1.5} className="text-black dark:text-white" />
            ) : (
                <Plus size={16} strokeWidth={1.5} className="text-black dark:text-white" />
            )}
        </div>
        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800 mt-2"></div>
        {isOpen && (
            <div className="mt-6 pb-4 animate-fadeIn">
                {children}
            </div>
        )}
    </div>
);

export default ProductList;
