'use client'

import { useState } from 'react'
import { ShoppingCart, Search, User, Menu, X, ChevronRight, Star, Minus, Plus, Heart } from 'lucide-react'

// Header Component
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="bg-black text-white py-3 px-4 text-center text-sm flex items-center justify-between">
        <span></span>
        <span className="text-white">Sign up and get 20% off to your first order. <button className="underline font-medium">Sign Up Now</button></span>
        <button className="text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <a href="/" className="text-2xl font-bold tracking-tight">SHOP.CO</a>
          <nav className="hidden md:flex items-center gap-8">
            <button className="text-sm text-gray-800 hover:text-black flex items-center gap-1">Shop <ChevronRight className="w-4 h-4" /></button>
            <button className="text-sm text-gray-800 hover:text-black">On Sale</button>
            <button className="text-sm text-gray-800 hover:text-black">New Arrivals</button>
            <button className="text-sm text-gray-800 hover:text-black">Brands</button>
          </nav>
        </div>

        <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 flex-1 max-w-xs mx-8">
          <Search className="w-4 h-4 text-gray-600" />
          <input placeholder="Search for products..." className="bg-transparent ml-2 outline-none text-sm flex-1" />
        </div>

        <div className="flex items-center gap-4">
          <button className="md:hidden text-gray-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <a href="/cart" className="text-gray-800 hover:text-black">
            <ShoppingCart className="w-6 h-6" />
          </a>
          <button className="text-gray-800 hover:text-black">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden px-4 pb-4 space-y-3">
          <button className="block text-sm text-gray-800 w-full text-left py-2">Shop</button>
          <button className="block text-sm text-gray-800 w-full text-left py-2">On Sale</button>
          <button className="block text-sm text-gray-800 w-full text-left py-2">New Arrivals</button>
          <button className="block text-sm text-gray-800 w-full text-left py-2">Brands</button>
        </nav>
      )}
    </header>
  )
}

// Product Images Gallery
function ProductGallery() {
  const [mainImage, setMainImage] = useState(0)
  const images = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-BWPsUjiVeiuODgPbqrsUlFQHUtjrRM.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-BWPsUjiVeiuODgPbqrsUlFQHUtjrRM.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-BWPsUjiVeiuODgPbqrsUlFQHUtjrRM.png',
  ]

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setMainImage(idx)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
              mainImage === idx ? 'border-black' : 'border-gray-200'
            }`}
          >
            <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      
      <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden h-96 md:h-auto">
        <img 
          src={images[mainImage]} 
          alt="Main product"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

// Review Item
function ReviewItem({ review }: { review: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="font-semibold flex items-center gap-2">
            {review.name}
            {review.verified && <span className="text-green-600 text-sm">✓ Verified Purchase</span>}
          </p>
        </div>
        <button className="text-gray-400 hover:text-black">⋯</button>
      </div>
      <p className="text-gray-600 text-sm mb-4">{review.text}</p>
      <p className="text-gray-500 text-xs">Posted on {review.date}</p>
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
            <div className="flex gap-4 text-sm">
              <button className="text-gray-700 hover:text-black">𝕏</button>
              <button className="text-gray-700 hover:text-black">f</button>
              <button className="text-gray-700 hover:text-black">⚫</button>
              <button className="text-gray-700 hover:text-black">◯</button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><button className="hover:text-black">About</button></li>
              <li><button className="hover:text-black">Features</button></li>
              <li><button className="hover:text-black">Works</button></li>
              <li><button className="hover:text-black">Career</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase">Help</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><button className="hover:text-black">Customer Support</button></li>
              <li><button className="hover:text-black">Delivery Details</button></li>
              <li><button className="hover:text-black">Terms & Conditions</button></li>
              <li><button className="hover:text-black">Privacy Policy</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase">FAQ</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><button className="hover:text-black">Account</button></li>
              <li><button className="hover:text-black">Manage Deliveries</button></li>
              <li><button className="hover:text-black">Orders</button></li>
              <li><button className="hover:text-black">Payments</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><button className="hover:text-black">Free eBooks</button></li>
              <li><button className="hover:text-black">Development Tutorial</button></li>
              <li><button className="hover:text-black">How to - Blog</button></li>
              <li><button className="hover:text-black">Youtube Playlist</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
          <p>Shop.co © 2000-2023. All Rights Reserved</p>
          <div className="flex gap-4 items-center mt-4 md:mt-0">
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

// Main Product Page
export default function ProductPage() {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState('brown')
  const [selectedSize, setSelectedSize] = useState('Large')
  const [activeTab, setActiveTab] = useState('reviews')

  const reviews = [
    {
      id: 1,
      name: 'Samantha D.',
      rating: 4,
      text: 'I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It\'s become my favorite go-to shirt.',
      date: 'August 14, 2023',
      verified: true
    },
    {
      id: 2,
      name: 'Alex M.',
      rating: 4,
      text: 'The t-shirt exceeded my expectations! The colors are vibrant and the print quality is as high-touch. Being a UX/UI designer myself, I\'m quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.',
      date: 'August 15, 2023',
      verified: true
    },
    {
      id: 3,
      name: 'Ethan R.',
      rating: 4,
      text: 'This t-shirt is a must-have for anyone who appreciates good design. The minimalistic art design caught my eye, and fit is perfect. I can see the designer\'s touch in every aspect of the shirt.',
      date: 'August 16, 2023',
      verified: true
    },
    {
      id: 4,
      name: 'Olivia P.',
      rating: 5,
      text: 'As a UX/UI enthusiast, I value simplicity and functionality. While also feels great to wear. It\'s evident that the designer poured their creativity into making this t-shirt stand out.',
      date: 'August 17, 2023',
      verified: true
    },
    {
      id: 5,
      name: 'Liam K.',
      rating: 4,
      text: 'This t-shirt is a fusion of comfort and creativity. The fabric is soft and the design speaks volumes about the designer\'s skill. It\'s wearing a piece of design philosophy.',
      date: 'August 18, 2023',
      verified: true
    },
    {
      id: 6,
      name: 'Ava H.',
      rating: 4,
      text: 'I\'m not just wearing a t-shirt. I\'m wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this shirt a conversation starter.',
      date: 'August 10, 2023',
      verified: true
    }
  ]

  const relatedProducts = [
    { id: 1, name: 'Polo with Contrast Trims', price: 212, originalPrice: 242, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-BWPsUjiVeiuODgPbqrsUlFQHUtjrRM.png', rating: 4.5 },
    { id: 2, name: 'Gradient Graphic T-shirt', price: 145, originalPrice: 145, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-BWPsUjiVeiuODgPbqrsUlFQHUtjrRM.png', rating: 3.5 },
    { id: 3, name: 'Polo with Tipping Details', price: 180, originalPrice: 180, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-BWPsUjiVeiuODgPbqrsUlFQHUtjrRM.png', rating: 4.5 },
    { id: 4, name: 'Black Striped T-shirt', price: 120, originalPrice: 160, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-BWPsUjiVeiuODgPbqrsUlFQHUtjrRM.png', rating: 5.0 },
  ]

  return (
    <main className="bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8 overflow-x-auto">
          <a href="/" className="hover:text-black whitespace-nowrap">Home</a>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <a href="/shop" className="hover:text-black whitespace-nowrap">Shop</a>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <a href="/shop" className="hover:text-black whitespace-nowrap">Men</a>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">T-Shirts</span>
        </div>

        {/* Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Gallery */}
          <ProductGallery />

          {/* Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">ONE LIFE GRAPHIC T-SHIRT</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.5/5 (88 Reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">$260</span>
              <span className="text-2xl text-gray-400 line-through">$300</span>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">-40%</span>
            </div>

            <p className="text-gray-600 mb-8">
              This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.
            </p>

            <hr className="mb-6" />

            {/* Colors */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Select Colors</p>
              <div className="flex gap-3">
                {['brown', 'green', 'navy'].map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-black' : 'border-gray-300'
                    }`}
                    style={{
                      backgroundColor: color === 'brown' ? '#8B6F47' : color === 'green' ? '#4A7C59' : '#1F3A5F'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Choose Size</p>
              <div className="flex gap-3 flex-wrap">
                {['Small', 'Medium', 'Large', 'X-Large'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-2 border rounded-lg font-medium text-sm transition-all ${
                      selectedSize === size 
                        ? 'bg-black text-white border-black' 
                        : 'border-gray-300 text-gray-800 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <hr className="mb-6" />

            {/* Actions */}
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3 flex-shrink-0">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-gray-600 hover:text-black"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-gray-600 hover:text-black"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <button className="flex-1 bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Add to Cart
              </button>

              <button className="p-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-12">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 font-medium text-sm transition-colors ${
                activeTab === 'details' 
                  ? 'text-black border-b-2 border-black' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 font-medium text-sm transition-colors ${
                activeTab === 'reviews' 
                  ? 'text-black border-b-2 border-black' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Rating & Reviews
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-4 font-medium text-sm transition-colors ${
                activeTab === 'faq' 
                  ? 'text-black border-b-2 border-black' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              FAQs
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        {activeTab === 'reviews' && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">All Reviews (88)</h2>
              <div className="flex gap-2">
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                  <option>Latest</option>
                  <option>Oldest</option>
                  <option>Most Helpful</option>
                </select>
                <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                  Write a Review
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {reviews.map(review => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>

            <button className="w-full py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Load More Reviews
            </button>
          </div>
        )}

        {/* Related Products */}
        <div className="py-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">YOU MIGHT ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(product => (
              <div key={product.id}>
                <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 h-48 md:h-64">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">${product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
