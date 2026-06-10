'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, Minus, Plus, Shield, Truck, RefreshCcw, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/lib/api'
import { useCart } from '@/components/CartProvider'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import ReviewsSection from '@/components/ReviewsSection'
import { AspectRatio } from '@/components/ui/aspect-ratio'

export default function ProductDetail({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const { slug } = params;
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [purchaseType, setPurchaseType] = useState<'money' | 'points'>('money');
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/slug/${slug}`);
      const data = response.data;
      setProduct(data);
      if (data.colors && data.colors.length > 0 && !selectedColor) setSelectedColor(data.colors[0]);
      if (data.sizes && data.sizes.length > 0 && !selectedSize) setSelectedSize(data.sizes[0]);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  // Derived state: images to display (either global or color-specific)
  const displayImages = (product?.colorImages?.[selectedColor] && product.colorImages[selectedColor].length > 0)
    ? product.colorImages[selectedColor]
    : (product?.images || []);

  // Reset main image index if it becomes out of bounds or if color changes
  useEffect(() => {
    setMainImageIndex(0);
  }, [selectedColor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items left in stock`);
      return;
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (purchaseType === 'points' && user && (user.points ?? 0) < (product.pointsPrice || 0) * quantity) {
      toast.error('Insufficient loyalty points');
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.discountedPrice !== undefined && product.discountedPrice !== null ? product.discountedPrice : product.price,
      pointsPrice: product.pointsPrice || 0,
      pointsReward: product.pointsReward || 0,
      quantity: quantity,
      image: displayImages[0] || product.images[0] || '/placeholder-product.png',
      selectedColor: selectedColor,
      selectedSize: selectedSize,
      usePoints: purchaseType === 'points',
      purchaseType: product.purchaseType,
    });

    toast.success('Added to cart', {
      action: {
        label: 'View Cart',
        onClick: () => router.push('/cart')
      }
    });
  }

  const currentPrice = product.discountedPrice !== undefined && product.discountedPrice !== null ? product.discountedPrice : product.price;
  const discount = product.price > currentPrice
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Image Gallery */}
            <div className="flex-1 flex flex-col md:flex-row gap-4">
              <div className="flex md:flex-col gap-4 order-2 md:order-1 overflow-x-auto md:overflow-y-auto max-h-[600px] w-full md:w-auto pb-4">
                {displayImages.map((img: string, i: number) => (
                  <div
                    key={img + i}
                    onClick={() => setMainImageIndex(i)}
                    className={`w-24 h-24 flex-shrink-0 relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${mainImageIndex === i ? 'border-black' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <AspectRatio ratio={1 / 1}>
                      <Image src={img} alt={`${product.name} ${i}`} fill className="object-cover" />
                    </AspectRatio>
                  </div>
                ))}
              </div>
              <div className="flex-1 relative w-full rounded-3xl border border-gray-50 overflow-hidden order-1 md:order-2 bg-gray-50/50">
                <AspectRatio ratio={1 / 1}>
                  <Image
                    src={displayImages?.[mainImageIndex] || '/placeholder-product.png'}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                    priority
                  />
                </AspectRatio>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col">
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="outline" className="text-gray-400 font-bold uppercase tracking-widest text-[10px] px-3">
                  {product.categoryId?.name || 'Uncategorized'}
                </Badge>
                {product.stock > 0 ? (
                  <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none font-bold uppercase tracking-widest text-[10px] px-3">In Stock</Badge>
                ) : (
                  <Badge variant="destructive" className="font-bold uppercase tracking-widest text-[10px] px-3">Out of Stock</Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black italic mb-4 uppercase tracking-tighter leading-none">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-sm font-black ml-1">{product.rating > 0 ? product.rating.toFixed(1) : "0.0"}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-5xl font-black italic tracking-tighter">${currentPrice}</span>
                {product.price > currentPrice && (
                  <span className="text-2xl text-gray-300 line-through font-bold">${product.price}</span>
                )}
                {discount > 0 && (
                  <Badge className="bg-red-50 text-red-500 border-none px-4 py-1 text-sm font-black italic">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {/* Purchase Options */}
              {product.purchaseType !== 'money' && (
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <button
                    onClick={() => setPurchaseType('money')}
                    className={`flex flex-col items-start p-5 border-2 rounded-3xl transition-all duration-300 ${purchaseType === 'money'
                        ? 'border-black bg-black text-white shadow-2xl translate-y-[-2px]'
                        : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200'
                      }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Standard</span>
                    <span className="text-lg font-black italic uppercase italic">Cash Payment</span>
                    <span className={`text-[10px] ${purchaseType === 'money' ? 'text-gray-400' : 'text-green-500'} font-black mt-2 uppercase`}>
                      + Earn {product.pointsReward} Points
                    </span>
                  </button>

                  <button
                    disabled={product.purchaseType === 'money'}
                    onClick={() => setPurchaseType('points')}
                    className={`flex flex-col items-start p-5 border-2 rounded-3xl transition-all duration-300 ${purchaseType === 'points'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-2xl translate-y-[-2px]'
                        : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200 disabled:opacity-50'
                      }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Loyalty</span>
                    <span className="text-lg font-black italic uppercase italic">{product.pointsPrice} LP</span>
                    <span className={`text-[10px] ${purchaseType === 'points' ? 'text-blue-200' : 'text-blue-500'} font-black mt-2 uppercase`}>
                      Redeem Points
                    </span>
                  </button>
                </div>
              )}

              <p className="text-gray-500 mb-10 leading-relaxed text-lg font-medium max-w-xl">
                {product.description}
              </p>

              <div className="space-y-10">
                {/* Colors */}
                {Array.isArray(product.colors) && product.colors.length > 0 && (
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Choose Color</p>
                    <div className="flex gap-3 flex-wrap">
                      {product.colors.map((color: string) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color
                              ? 'border-black scale-110 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        >
                          {selectedColor === color && <Check className={`w-4 h-4 ${['white', 'yellow'].includes(color.toLowerCase()) ? 'text-black' : 'text-white'}`} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Select Size</p>
                    <div className="flex gap-3 flex-wrap">
                      {product.sizes.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${selectedSize === size
                              ? 'bg-black text-white shadow-xl translate-y-[-2px]'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Add to Cart */}
                <div className="flex gap-4 items-center pt-4">
                  <div className="flex items-center bg-gray-50 rounded-3xl px-8 py-5 gap-10">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-gray-400 hover:text-black transition-colors"
                    >
                      <Minus className="w-5 h-5 stroke-[3px]" />
                    </button>
                    <span className="font-black text-2xl min-w-[30px] text-center italic">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="text-gray-400 hover:text-black transition-colors disabled:opacity-20"
                    >
                      <Plus className="w-5 h-5 stroke-[3px]" />
                    </button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    disabled={product.stock <= 0}
                    className="flex-1 h-[70px] bg-black hover:bg-zinc-800 rounded-3xl text-xl font-black uppercase tracking-wider shadow-2xl hover:shadow-zinc-300 transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>

              {/* Delivery info */}
              <div className="flex flex-wrap gap-10 mt-16 py-10 border-y border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Fast Delivery</p>
                    <p className="text-xs font-bold">Estimated 2-3 Days</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Warrantee</p>
                    <p className="text-xs font-bold">100% Authentic</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                    <RefreshCcw className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Returns</p>
                    <p className="text-xs font-bold">30 Day Window</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="mt-24">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start border-b border-gray-100 bg-transparent h-auto p-0 gap-12">
                <TabsTrigger
                  value="details"
                  className="px-4 py-6 data-[state=active]:border-b-4 data-[state=active]:border-black rounded-none shadow-none text-xl font-black uppercase tracking-tighter italic data-[state=active]:bg-transparent"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="px-4 py-6 data-[state=active]:border-b-4 data-[state=active]:border-black rounded-none shadow-none text-xl font-black uppercase tracking-tighter italic data-[state=active]:bg-transparent"
                >
                  Reviews ({product.numReviews})
                </TabsTrigger>
                <TabsTrigger
                  value="faq"
                  className="px-4 py-6 data-[state=active]:border-b-4 data-[state=active]:border-black rounded-none shadow-none text-xl font-black uppercase tracking-tighter italic data-[state=active]:bg-transparent"
                >
                  FAQ
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="py-16">
                <div className="max-w-4xl">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-8 leading-none">Uncompromising Quality</h3>
                  <div
                    className="prose prose-xl max-w-none text-gray-400 font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 p-10 bg-gray-50 rounded-3xl">
                    <div>
                      <h4 className="font-black uppercase tracking-[0.2em] text-xs mb-4 text-black">Materials</h4>
                      <p className="text-gray-500 font-medium leading-relaxed">Premium sourced fabrics designed for maximum comfort and durability. Our commitment to sustainability means every thread counts.</p>
                    </div>
                    <div>
                      <h4 className="font-black uppercase tracking-[0.2em] text-xs mb-4 text-black">Care Instruction</h4>
                      <p className="text-gray-500 font-medium leading-relaxed">To maintain the premium finish, we recommend machine washing cold and natural drying. Avoid harsh detergents.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews">
                <ReviewsSection key={`${product._id}-${product.numReviews}`} productId={product._id} onReviewAdded={fetchProduct} />
              </TabsContent>
              <TabsContent value="faq" className="py-20 text-center">
                <div className="max-w-xl mx-auto">
                  <p className="text-gray-400 font-medium text-lg italic uppercase">Frequently asked questions coming soon.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
