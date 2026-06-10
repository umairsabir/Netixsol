'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Search, User, Menu, X, ChevronRight, Star, ChevronDown, SlidersHorizontal, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// Header Component
import Navbar from '@/components/Navbar'

// Product Card
function ProductCard({ product }: { product: any }) {
  const currentPrice = product.discountedPrice !== undefined && product.discountedPrice !== null ? product.discountedPrice : product.price
  const originalPrice = (product.discountedPrice !== null && product.discountedPrice !== undefined && product.discountedPrice < product.price) ? product.price : null
  const discount = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative bg-gray-100 rounded-[20px] overflow-hidden mb-4 aspect-square">
        <img
          src={product.images?.[0] || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mxMkG7OSGrEnTisLITbX6FkoeVAL67.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            -{discount}%
          </div>
        )}
      </div>
      <h3 className="font-bold text-sm md:text-base mb-1 truncate text-gray-900 group-hover:text-gray-600">{product.name}</h3>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
          ))}
        </div>
        <span className="text-[11px] text-gray-500 font-medium">{product.rating || "4.5"}/5</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg md:text-xl text-gray-900">${currentPrice}</span>
        {originalPrice && (
          <span className="text-sm md:text-base text-gray-400 font-bold line-through">${originalPrice}</span>
        )}
      </div>
    </Link>
  )
}

// Sidebar Filter
function SidebarFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  selectedColors,
  onColorChange,
  selectedSizes,
  onSizeChange,
  onClearAll
}: {
  categories: any[],
  selectedCategory: string,
  onCategoryChange: (id: string) => void,
  priceRange: number,
  onPriceChange: (val: number) => void,
  selectedColors: string[],
  onColorChange: (color: string) => void,
  selectedSizes: string[],
  onSizeChange: (size: string) => void,
  onClearAll: () => void
}) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    color: true,
    size: true,
    style: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const hasActiveFilters = selectedCategory !== 'All' || priceRange !== 2000 || selectedColors.length > 0 || selectedSizes.length > 0;

  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Filters
            <SlidersHorizontal className="w-5 h-5" />
          </h3>
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="text-xs text-gray-400 hover:text-black font-bold uppercase tracking-widest transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between font-bold text-sm mb-4 text-gray-700 hover:text-black transition-colors"
        >
          Categories
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.category && (
          <div className="space-y-2 ml-2 mb-4">
            <button
              onClick={() => onCategoryChange('All')}
              className={`block w-full text-left px-2 py-1 rounded-md text-sm transition-colors ${selectedCategory === 'All' ? 'bg-gray-100 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => onCategoryChange(cat._id)}
                className={`block w-full text-left px-2 py-1 rounded-md text-sm transition-colors ${selectedCategory === cat._id ? 'bg-gray-100 font-bold text-black' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Price */}
      <div>
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-semibold mb-4"
        >
          Max Price
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.price && (
          <div className="space-y-4 ml-4">
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={priceRange}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <p className="text-sm text-gray-600 font-bold">${priceRange}</p>
          </div>
        )}
      </div>

      {/* Colors */}
      <div>
        <button
          onClick={() => toggleSection('color')}
          className="w-full flex items-center justify-between font-semibold mb-4"
        >
          Colors
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.color ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.color && (
          <div className="flex flex-wrap gap-3 ml-4">
            {[
              { name: 'Green', color: '#00AA44' },
              { name: 'Red', color: '#FF0000' },
              { name: 'Yellow', color: '#FFD700' },
              { name: 'Orange', color: '#FF8800' },
              { name: 'Cyan', color: '#00AAFF' },
              { name: 'Blue', color: '#0000FF' },
              { name: 'Purple', color: '#AA00FF' },
              { name: 'Pink', color: '#FF00FF' },
              { name: 'White', color: '#FFFFFF' },
              { name: 'Black', color: '#000000' },
            ].map(({ name, color }) => (
              <button
                key={name}
                onClick={() => onColorChange(name)}
                className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${selectedColors.includes(name) ? 'border-black scale-110 shadow-md' : 'border-gray-200'}`}
                style={{ backgroundColor: color }}
                title={name}
              >
                {selectedColors.includes(name) && <div className="w-1.5 h-1.5 bg-white rounded-full mix-blend-difference" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Size */}
      <div>
        <button
          onClick={() => toggleSection('size')}
          className="w-full flex items-center justify-between font-semibold mb-4"
        >
          Size
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.size ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.size && (
          <div className="grid grid-cols-2 gap-2 ml-4">
            {['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'].map(size => (
              <label key={size} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-black font-medium">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  checked={selectedSizes.includes(size)}
                  onChange={() => onSizeChange(size)}
                />
                {size}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 pt-4">
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="w-full bg-white text-black border border-gray-200 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors uppercase tracking-widest text-[10px]"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  )
}

// Footer
function Footer() {
  return (
    <footer className="bg-gray-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-lg mb-4">SHOP.CO</h3>
            <p className="text-gray-600 text-sm mb-4">
              We have clothes that suits your style and which you're proud to wear.
            </p>
            <div className="flex gap-4 text-sm font-bold">
              <button className="text-gray-700 hover:text-black">𝕏</button>
              <button className="text-gray-700 hover:text-black">f</button>
              <button className="text-gray-700 hover:text-black">⚫</button>
              <button className="text-gray-700 hover:text-black">◯</button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
              <li><button className="hover:text-black">About</button></li>
              <li><button className="hover:text-black">Features</button></li>
              <li><button className="hover:text-black">Works</button></li>
              <li><button className="hover:text-black">Career</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase">Help</h4>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
              <li><button className="hover:text-black">Customer Support</button></li>
              <li><button className="hover:text-black">Delivery Details</button></li>
              <li><button className="hover:text-black">Terms & Conditions</button></li>
              <li><button className="hover:text-black">Privacy Policy</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase">FAQ</h4>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
              <li><button className="hover:text-black">Account</button></li>
              <li><button className="hover:text-black">Manage Deliveries</button></li>
              <li><button className="hover:text-black">Orders</button></li>
              <li><button className="hover:text-black">Payments</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
              <li><button className="hover:text-black">Free eBooks</button></li>
              <li><button className="hover:text-black">Development Tutorial</button></li>
              <li><button className="hover:text-black">How to - Blog</button></li>
              <li><button className="hover:text-black">Youtube Playlist</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
          <p className="font-medium">Shop.co © 2000-2023. All Rights Reserved</p>
          <div className="flex gap-4 items-center mt-4 md:mt-0 opacity-50">
            <span>💳</span>
            <span>🔵</span>
            <span>📦</span>
            <span>🍎</span>
            <span>🔵</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Shop Page
function ShopPageContent() {
  const searchParams = useSearchParams()
  
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || 'All'
  const initialSort = searchParams.get('sort') || 'most-popular'
  const initialOnSale = searchParams.get('onSale') === 'true'
  const initialMaxPrice = Number(searchParams.get('maxPrice')) || 2000
  const initialColors = searchParams.get('colors')?.split(',').filter(Boolean) || []
  const initialSizes = searchParams.get('sizes')?.split(',').filter(Boolean) || []

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState(initialSort)
  const [priceRange, setPriceRange] = useState(initialMaxPrice)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [isOnSale, setIsOnSale] = useState(initialOnSale)
  const [selectedColors, setSelectedColors] = useState<string[]>(initialColors)
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialSizes)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params: any = {
        page,
        limit: 9,
        sortBy,
      }
      if (selectedCategory !== 'All') params.categoryId = selectedCategory
      if (priceRange < 2000) params.maxPrice = priceRange
      if (searchQuery) params.search = searchQuery
      if (isOnSale) params.onSale = 'true'
      if (selectedColors.length > 0) params.colors = selectedColors
      if (selectedSizes.length > 0) params.sizes = selectedSizes

      const res = await api.get('/products', { params })
      setProducts(res.data.products || [])
      setTotalPages(res.data.totalPages || 1)
      setTotalProducts(res.data.totalCount || 0)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data || [])).catch(console.error)
  }, [])

  // Update state if URL params change (e.g. Back button)
  useEffect(() => {
    setSearchQuery(initialSearch)
    setSelectedCategory(initialCategory)
    setSortBy(initialSort)
    setIsOnSale(initialOnSale)
    setPriceRange(initialMaxPrice)
    setSelectedColors(initialColors)
    setSelectedSizes(initialSizes)
    setPage(1)
  }, [initialSearch, initialCategory, initialSort, initialOnSale, initialMaxPrice, JSON.stringify(initialColors), JSON.stringify(initialSizes)])

  // Sync state TO URL
  useEffect(() => {
    const url = new URL(window.location.href);
    
    if (searchQuery) url.searchParams.set('search', searchQuery); else url.searchParams.delete('search');
    if (selectedCategory !== 'All') url.searchParams.set('category', selectedCategory); else url.searchParams.delete('category');
    if (sortBy !== 'most-popular') url.searchParams.set('sort', sortBy); else url.searchParams.delete('sort');
    if (isOnSale) url.searchParams.set('onSale', 'true'); else url.searchParams.delete('onSale');
    if (priceRange !== 2000) url.searchParams.set('maxPrice', priceRange.toString()); else url.searchParams.delete('maxPrice');
    if (selectedColors.length > 0) url.searchParams.set('colors', selectedColors.join(',')); else url.searchParams.delete('colors');
    if (selectedSizes.length > 0) url.searchParams.set('sizes', selectedSizes.join(',')); else url.searchParams.delete('sizes');
    
    // Using replaceState to avoid history spamming during rapid changes (like sliding range)
    window.history.replaceState({}, '', url.toString());
  }, [searchQuery, selectedCategory, sortBy, isOnSale, priceRange, JSON.stringify(selectedColors), JSON.stringify(selectedSizes)])

  useEffect(() => {
    fetchProducts()
  }, [page, sortBy, searchQuery, selectedCategory, isOnSale, priceRange, JSON.stringify(selectedColors), JSON.stringify(selectedSizes)])

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    )
  }

  const handleSearchUpdate = (newSearch: string) => {
    setSearchQuery(newSearch);
    setPage(1);
  }

  const handleSortUpdate = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
  }

  const handleClearAll = () => {
    setSelectedCategory('All')
    setPriceRange(2000)
    setSelectedColors([])
    setSelectedSizes([])
    setPage(1)
  }

  const handleClearSearch = () => {
    handleSearchUpdate('');
  }

  const handleClearSale = () => {
    setIsOnSale(false);
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8 font-medium">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-black font-bold">Shop</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 border border-gray-100 rounded-[20px] p-6 h-fit bg-gray-50/30">
            <SidebarFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              selectedColors={selectedColors}
              onColorChange={handleColorToggle}
              selectedSizes={selectedSizes}
              onSizeChange={handleSizeToggle}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Active Filter Badges */}
            {(searchQuery || isOnSale) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors"
                  >
                    Search: {searchQuery}
                    <X className="w-3 h-3" />
                  </button>
                )}
                {isOnSale && (
                  <button 
                    onClick={handleClearSale}
                    className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-red-100 transition-colors border border-red-100"
                  >
                    ON SALE
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Header with Sort */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <p className="text-sm text-gray-500 font-medium">
                Showing {(page - 1) * 9 + 1}-{Math.min(page * 9, totalProducts)} of {totalProducts} Products
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortUpdate(e.target.value)}
                  className="border-none bg-transparent font-bold text-sm focus:ring-0 cursor-pointer"
                >
                  <option value="most-popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-gray-200" />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
                {products.length > 0 ? (
                  products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No products found holding your criteria</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className="flex items-center gap-2 text-gray-600 hover:text-black text-sm font-bold border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const p = idx + 1;
                    return (
                      <button
                        key={idx}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${p === page
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-100 text-gray-400'
                          }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  className="flex items-center gap-2 text-gray-600 hover:text-black text-sm font-bold border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-black opacity-20" />
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  )
}
