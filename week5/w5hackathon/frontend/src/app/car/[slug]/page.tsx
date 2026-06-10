"use client";
import Image from "next/image";
import { Check, Loader2, Star, Clock, Hammer, Tag, Gauge, ArrowUpRight, Minus, Plus, User as UserIcon, Mail, Phone, Flag, ShieldCheck } from "lucide-react";
import PageHero from "@/components/common/page-hero";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useSocketContext } from "@/context/socket-context";
import { useAppSelector } from "@/store/hooks";
import { useCountdown } from "@/hooks/use-countdown";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronDown, Expand } from "lucide-react";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

export default function CarAuctionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const carId = params.slug as string;
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const { socket, joinCar, leaveCar } = useSocketContext();
    const [car, setCar] = useState<any>(null);
    const timeLeft = useCountdown(car?.auctionEndDate);
    const [bids, setBids] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Lightbox Component
    const Lightbox = () => {
        if (!isLightboxOpen) return null;
        const images = car.images?.length > 0 ? car.images : ["/placeholder-car.webp"];
        
        return (
            <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-10 backdrop-blur-sm animate-in fade-in duration-300">
                <button 
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute top-6 right-6 text-white hover:text-[#F4C23D] transition-colors p-2"
                >
                    <Plus size={40} className="rotate-45" />
                </button>
                
                <div className="relative w-full max-w-6xl aspect-[16/9] lg:aspect-video flex items-center justify-center">
                    <button 
                        onClick={() => setActiveImageIndex(prev => (prev - 1 + images.length) % images.length)}
                        className="absolute left-0 text-white/50 hover:text-white transition-all p-4 z-10"
                    >
                        <ChevronDown size={48} className="rotate-90" />
                    </button>
                    
                    <div className="relative w-full h-full">
                        <Image
                            src={images[activeImageIndex]}
                            alt="Full View"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <button 
                        onClick={() => setActiveImageIndex(prev => (prev + 1) % images.length)}
                        className="absolute right-0 text-white/50 hover:text-white transition-all p-4 z-10"
                    >
                        <ChevronDown size={48} className="-rotate-90" />
                    </button>
                </div>

                {/* Lightbox Thumbnails */}
                <div className="mt-8 flex gap-3 overflow-x-auto pb-4 max-w-full px-4 custom-scrollbar">
                    {images.map((img: string, i: number) => (
                        <div 
                            key={i}
                            onClick={() => setActiveImageIndex(i)}
                            className={`relative w-20 h-20 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${i === activeImageIndex ? 'border-[#F4C23D] scale-110' : 'border-white/20 opacity-50'}`}
                        >
                            <Image src={img} alt="Thumb" fill className="object-cover" />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [carRes, bidsRes] = await Promise.all([
                    api.get(`/cars/${carId}`),
                    api.get(`/bids/car/${carId}`)
                ]);
                setCar(carRes.data);
                setBids(bidsRes.data);
                setBidAmount(Math.max(carRes.data.currentBid, carRes.data.startingBid) + 100);
            } catch (err) {
                console.error("Failed to fetch car details:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (carId) fetchData();
    }, [carId]);

    useEffect(() => {
        if (socket && carId) {
            joinCar(carId);

            socket.on('newBid', (newBid: any) => {
                setBids(prev => {
                    if (prev.some(b => b._id === newBid._id)) return prev;
                    return [newBid, ...prev];
                });
                setCar((prevCar: any) => {
                    const updatedCar = {
                        ...prevCar,
                        currentBid: newBid.amount,
                        bidCount: (prevCar?.bidCount || 0) + 1
                    };
                    setBidAmount(newBid.amount + (updatedCar.minIncrement || 100));
                    return updatedCar;
                });
            });

            socket.on('auctionEnded', (data: any) => {
                setCar((prev: any) => ({ ...prev, status: 'sold' }));
            });

            return () => {
                socket.off('newBid');
                socket.off('auctionEnded');
                leaveCar(carId);
            };
        }
    }, [socket, carId, joinCar, leaveCar]);

    const handlePlaceBid = async () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        if (car.uploadedBy._id === user?._id) {
            setError("You cannot bid on your own car.");
            return;
        }

        const minRequired = car.currentBid + (car.minIncrement || 100);
        if (bidAmount < minRequired) {
            setError(`Bid must be at least ${formatCurrency(minRequired)} (Current + Min Increment)`);
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await api.post("/bids", { carId, amount: bidAmount });
            setBidAmount(bidAmount + 100);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to place bid.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-[#2E3D83]">
                <Loader2 className="animate-spin" size={64} />
                <span className="ml-4 text-2xl font-bold">Loading Auction Details...</span>
            </div>
        );
    }

    if (!car) return <div className="p-20 text-center text-2xl font-bold">Car not found.</div>;

    const isOwner = user && car && (
        (typeof car.uploadedBy === 'string' && car.uploadedBy === (user._id || user.id)) ||
        (car.uploadedBy?._id === (user._id || user.id)) ||
        (car.uploadedBy?.id === (user._id || user.id))
    );

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const topBid = bids.length > 0 ? bids[0] : null;

    return (
        <main className="min-h-screen bg-[#FDFDFD] pb-24">
            <PageHero
                title={car.title}
                subtitle={`${car.year} ${car.make} ${car.model} available for bidding.`}
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Auction", href: "/auction" },
                    { label: car.title }
                ]}
            />

            <div className="container mx-auto px-4 lg:px-[118px] -mt-8 relative z-10">
                {/* Product Title Bar */}
                <div className="bg-[#2E3D83] rounded-t-[10px] w-full h-[70px] flex items-center justify-between px-8 shadow-lg">
                    <h2 className="text-white text-[24px] font-bold tracking-tight">
                        {car.title}
                    </h2>
                    <button className="text-white/80 hover:text-[#F4C23D] transition-colors">
                        <Star size={24} className="fill-current" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-b-[10px] p-6 lg:p-10 shadow-xl flex flex-col gap-10">

                    {/* Image Gallery Section: 1+6 Grid & Lightbox */}
                    <div className="flex flex-col gap-6">
                        <Lightbox />
                        
                        {/* Winner Banner */}
                        {car.status === 'sold' && (
                            <div className="w-full bg-[#F9C146]/10 border-2 border-[#F9C146] rounded-[10px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in duration-500 shadow-lg">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-[#F9C146] rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white shrink-0">
                                        🏆
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-[22px] font-black text-[#2E3D83] uppercase tracking-tighter leading-none">
                                            Auction Winner Announced!
                                        </h3>
                                        <p className="text-[#545677] font-medium mt-1">
                                            Congratulations to <span className="font-bold text-[#2E3D83] underline">{topBid?.user?.firstName} {topBid?.user?.lastName}</span> for winning this auction.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center md:items-end">
                                    <span className="text-[12px] font-bold text-[#2E3D83] uppercase tracking-widest opacity-60">Final Sale Price</span>
                                    <span className="text-[32px] font-black text-[#2E3D83] leading-none">{formatCurrency(car.currentBid)}</span>
                                </div>
                            </div>
                        )}

                        {/* Desktop: 1+6 Grid */}
                        <div className="hidden lg:flex gap-4 h-[550px]">
                            {/* Featured View (Left) */}
                            <div 
                                className="relative flex-[2] bg-gray-50 rounded-[10px] overflow-hidden border border-[#EAECF3] cursor-zoom-in group shadow-lg"
                                onClick={() => setIsLightboxOpen(true)}
                            >
                                {car.status === 'live' && (
                                    <div className="absolute left-6 top-6 z-20 bg-[#EF233C] text-white px-4 py-2 rounded-[5px] flex items-center gap-2 shadow-lg scale-90 md:scale-100">
                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        <span className="text-[14px] font-bold uppercase tracking-wider">Live Now</span>
                                    </div>
                                )}
                                
                                <Image
                                    src={car.images?.[activeImageIndex] || "/placeholder-car.webp"}
                                    alt={car.title}
                                    fill
                                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                                    priority
                                />
                                
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="bg-white/90 p-4 rounded-full shadow-2xl">
                                        <Expand size={24} className="text-[#2E3D83]" />
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail Grid (Right - 2 columns x 3 rows) */}
                            <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-4">
                                {(car.images?.slice(0, 6) || []).map((img: string, i: number) => (
                                    <div 
                                        key={i}
                                        onClick={() => setActiveImageIndex(i)}
                                        className={`relative rounded-[8px] overflow-hidden cursor-pointer border-2 transition-all group ${i === activeImageIndex ? 'border-[#2E3D83]' : 'border-transparent hover:border-[#EAECF3]'}`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Thumbnail ${i}`}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {i === 5 && car.images?.length > 6 && (
                                            <div 
                                                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10"
                                                onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                                            >
                                                <span className="text-[20px] font-bold">+{car.images.length - 6}</span>
                                                <span className="text-[10px] uppercase font-medium tracking-wider">More Views</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {/* Fill empty slots if less than 6 images */}
                                {car.images?.length < 6 && [...Array(Math.max(0, 6 - (car.images?.length || 0)))].map((_, i) => (
                                    <div key={`empty-${i}`} className="bg-gray-50 rounded-[8px] border-2 border-dashed border-[#EAECF3] flex items-center justify-center">
                                        <Image src="/placeholder-car.webp" alt="Empty" width={40} height={40} className="opacity-10" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile/Tablet: Swiper Slider */}
                        <div className="lg:hidden flex flex-col gap-4">
                            <div className="relative aspect-[16/9] rounded-[10px] overflow-hidden bg-gray-50 border border-[#EAECF3]">
                                <Swiper
                                    modules={[Navigation, Thumbs, Autoplay]}
                                    spaceBetween={10}
                                    onSlideChange={(s) => setActiveImageIndex(s.activeIndex)}
                                    className="w-full h-full"
                                >
                                    {(car.images?.length > 0 ? car.images : ["/placeholder-car.webp"]).map((img: string, i: number) => (
                                        <SwiperSlide key={i} onClick={() => setIsLightboxOpen(true)}>
                                            <Image src={img} alt="Car View" fill className="object-contain p-2" />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                            
                            <div className="h-20 w-full">
                                <Swiper
                                    spaceBetween={10}
                                    slidesPerView={4}
                                    freeMode={true}
                                    watchSlidesProgress={true}
                                    modules={[FreeMode, Thumbs]}
                                    className="h-full"
                                >
                                    {(car.images?.length > 0 ? car.images : []).map((img: string, i: number) => (
                                        <SwiperSlide key={i} onClick={() => setActiveImageIndex(i)} className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${i === activeImageIndex ? 'border-[#2E3D83]' : 'border-transparent'}`}>
                                            <Image src={img} alt="Thumb" fill className="object-cover" />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-px bg-[#EAECF3] border border-[#EAECF3] rounded-[10px] overflow-hidden shadow-sm">
                        <div className="bg-white p-4 flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2 text-[#2E3D83]">
                                <Clock size={16} />
                                <span className="text-[12px] font-bold uppercase tracking-wider">Time Left</span>
                            </div>
                            <span className={`text-[14px] font-bold ${timeLeft.isExpired ? 'text-gray-400' : 'text-[#EF233C]'}`}>
                                {timeLeft.isExpired ? "Ended" : `${timeLeft.days}D : ${timeLeft.hours}H : ${timeLeft.minutes}M`}
                            </span>
                        </div>
                        <div className="bg-white p-4 flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-1 text-[#2E3D83]">
                                <Hammer size={16} />
                                <span className="text-[12px] font-bold uppercase tracking-wider">Current Bid</span>
                            </div>
                            <span className="text-[14px] font-bold text-[#2E3D83]">{formatCurrency(car.currentBid)}</span>
                        </div>
                        <div className="bg-white p-4 flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2 text-[#2E3D83]">
                                <Clock size={16} />
                                <span className="text-[12px] font-bold uppercase tracking-wider">End Time</span>
                            </div>
                            <span className="text-[14px] font-bold text-[#2E3D83]">
                                {car.auctionEndDate ? new Date(car.auctionEndDate).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                            </span>
                        </div>
                        <div className="bg-white p-4 flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2 text-[#2E3D83]">
                                <ArrowUpRight size={16} />
                                <span className="text-[12px] font-bold uppercase tracking-wider">Min Inc.</span>
                            </div>
                            <span className="text-[14px] font-bold text-[#2E3D83]">${car.minIncrement || 100}</span>
                        </div>
                        <div className="bg-white p-4 flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2 text-[#2E3D83]">
                                <Hammer size={16} />
                                <span className="text-[12px] font-bold uppercase tracking-wider">Total Bids</span>
                            </div>
                            <span className="text-[14px] font-bold text-[#2E3D83]">{car.bidCount || 0}</span>
                        </div>
                        <div className="bg-white p-4 flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2 text-[#2E3D83]">
                                <Tag size={16} />
                                <span className="text-[12px] font-bold uppercase tracking-wider">Lot No.</span>
                            </div>
                            <span className="text-[14px] font-bold text-[#2E3D83]">{car.lotNumber || "N/A"}</span>
                        </div>
                        <div className="bg-white p-4 flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2 text-[#2E3D83]">
                                <Gauge size={16} />
                                <span className="text-[12px] font-bold uppercase tracking-wider">Odometer</span>
                            </div>
                            <span className="text-[14px] font-bold text-[#2E3D83]">{car.mileage?.toLocaleString()} KM</span>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left Column: Details & Top Bidder */}
                        <div className="flex-1 flex flex-col gap-12">
                            {/* Description Section */}
                            <div className="flex flex-col gap-6">
                                <h3 className="text-[24px] font-bold text-[#2E3D83] relative inline-block w-fit">
                                    Description
                                    <span className="absolute -bottom-2 left-0 w-full h-[4px] bg-[#F4C23D] rounded-full" />
                                </h3>
                                <div className="text-[#545677] text-[16px] leading-relaxed font-medium mt-4">
                                    {car.description || "No detailed description provided for this vehicle."}
                                    <p className="mt-4">
                                        Experience sheer driving pleasure with this meticulously maintained {car.title}.
                                        Combining luxury with performance, it offers an unparalleled journey every time you sit behind the wheel.
                                    </p>
                                </div>
                            </div>

                            {/* Top Bidder Section */}
                            <div className="flex flex-col gap-6">
                                <div className="bg-[#2E3D83] h-[50px] rounded-t-[8px] flex items-center px-6 shadow-sm">
                                    <h3 className="text-white text-[18px] font-bold uppercase tracking-tight">Top Bidder</h3>
                                </div>
                                <div className="bg-[#F1F2FF] rounded-b-[8px] p-8 border border-[#EAECF3] flex flex-col md:flex-row gap-10 items-center">
                                    <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0 bg-gray-50">
                                        <Image
                                            src={topBid?.user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topBid?.user?.firstName || 'User'}`}
                                            alt="Top Bidder"
                                            fill
                                            className="object-cover bg-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 flex-1 gap-x-12 gap-y-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[14px] text-[#2E3D83] font-bold flex items-center gap-2">
                                                <UserIcon size={14} /> Full Name
                                            </span>
                                            <span className="text-[16px] text-[#545677] font-semibold">
                                                {topBid ? `${topBid.user.firstName} ${topBid.user.lastName}` : "No bids yet"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[14px] text-[#2E3D83] font-bold flex items-center gap-2">
                                                <Mail size={14} /> Email
                                            </span>
                                            <span className="text-[16px] text-[#545677] font-semibold truncate">
                                                {topBid?.user?.email || "---"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[14px] text-[#2E3D83] font-bold flex items-center gap-2">
                                                <Phone size={14} /> Mobile Number
                                            </span>
                                            <span className="text-[16px] text-[#545677] font-semibold">
                                                {topBid?.user?.phone || "---"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[14px] text-[#2E3D83] font-bold flex items-center gap-2">
                                                <Flag size={14} /> Nationality
                                            </span>
                                            <span className="text-[16px] text-[#545677] font-semibold">
                                                {topBid?.user?.nationality || "---"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[14px] text-[#2E3D83] font-bold flex items-center gap-2">
                                                <ShieldCheck size={14} /> ID Type
                                            </span>
                                            <span className="text-[16px] text-[#545677] font-semibold">
                                                {topBid?.user?.idType || "---"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Bidding Controls */}
                        <div className="w-full lg:w-[320px] flex flex-col gap-6">
                            {/* Bidding Card */}
                            <div className="bg-[#F1F2FF] rounded-[10px] p-6 border border-[#EAECF3] shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-bold text-[#2E3D83] uppercase">Starts From</span>
                                        <span className="text-[18px] font-bold text-[#2E3D83]">{formatCurrency(car.startingBid)}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[12px] font-bold text-[#2E3D83] uppercase">Current Bid</span>
                                        <span className="text-[18px] font-bold text-[#2E3D83]">{formatCurrency(car.currentBid)}</span>
                                    </div>
                                </div>

                                {/* Bidding Progress Slider */}
                                <div className="relative h-2 bg-white rounded-full mb-8 shadow-inner border border-gray-100">
                                    <div
                                        className="absolute h-full bg-[#F4C23D] rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((car.currentBid - car.startingBid) / car.startingBid) * 100 + 10, 100)}%` }}
                                    />
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-[#2E3D83] rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all duration-500"
                                        style={{ left: `calc(${Math.min(((car.currentBid - car.startingBid) / car.startingBid) * 100 + 10, 100)}% - 12px)` }}
                                    >
                                        <Hammer size={10} className="text-[#F4C23D]" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {car.status === 'live' ? (
                                        <>
                                            {!isOwner ? (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-[18px] font-bold text-[#2E3D83]">{car.bidCount || 0}</span>
                                                            <span className="text-[10px] text-[#A0A0A0] uppercase font-bold">Bids Placed</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-white border border-[#EAECF3] p-1 rounded-[5px] shadow-sm">
                                                            <button
                                                                onClick={() => setBidAmount(prev => Math.max(car.currentBid + (car.minIncrement || 100), prev - (car.minIncrement || 100)))}
                                                                className="w-8 h-8 flex items-center justify-center text-[#2E3D83] hover:bg-gray-100 rounded transition-colors shrink-0"
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                            <div className="flex items-center gap-1 text-[14px] font-bold text-[#2E3D83] min-w-[100px]">
                                                                <span className="text-[#A0A0A0] font-medium">$</span>
                                                                <input 
                                                                    type="number"
                                                                    value={bidAmount || ''}
                                                                    onChange={(e) => setBidAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                                                                    placeholder="0"
                                                                    className="w-full text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => setBidAmount(prev => prev + (car.minIncrement || 100))}
                                                                className="w-8 h-8 flex items-center justify-center text-[#2E3D83] hover:bg-gray-100 rounded transition-colors shrink-0"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {error && <p className="text-red-500 text-xs text-center -mb-4 animate-shake">{error}</p>}

                                                    <button
                                                        disabled={isSubmitting}
                                                        onClick={handlePlaceBid}
                                                        className="w-full h-[55px] bg-[#2E3D83] text-white text-[16px] font-bold rounded-[5px] hover:bg-opacity-95 transition-all shadow-lg active:scale-[0.98] uppercase tracking-wider"
                                                    >
                                                        {isSubmitting ? "Processing..." : "Submit A Bid"}
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="bg-[#2E3D83]/5 border-2 border-dashed border-[#2E3D83]/20 rounded-[8px] p-6 text-center">
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                        <UserIcon size={20} className="text-[#2E3D83]" />
                                                    </div>
                                                    <h4 className="text-[16px] font-bold text-[#2E3D83] uppercase tracking-tight mb-2">Seller Control</h4>
                                                    <p className="text-[12px] text-[#545677] font-medium leading-relaxed">
                                                        You are the owner of this vehicle. Monitor the bid activity below and manage your listing from the dashboard.
                                                    </p>
                                                    <button 
                                                        onClick={() => router.push('/my-profile?tab=my-cars')}
                                                        className="mt-4 text-[12px] font-bold text-[#2E3D83] hover:underline uppercase tracking-wider"
                                                    >
                                                        My Dashboard →
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="bg-[#2E3D83] border border-[#2E3D83] rounded-[8px] p-8 text-center shadow-lg relative overflow-hidden">
                                            {/* Decorative background icon */}
                                            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                                                <Hammer size={120} className="text-white" />
                                            </div>
                                            
                                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                                                <Clock size={32} className="text-white" />
                                            </div>
                                            <h4 className="text-[20px] font-black text-white uppercase tracking-tight mb-2 relative z-10">Listing Closed</h4>
                                            <p className="text-[13px] text-white/80 font-medium leading-relaxed mb-6 relative z-10">
                                                This car has been successfully sold. Bidding is no longer active for this listing.
                                            </p>
                                            <button 
                                                onClick={() => router.push('/auction')}
                                                className="w-full py-3 bg-white text-[#2E3D83] text-[12px] font-bold uppercase tracking-widest rounded-[5px] hover:bg-[#F4C23D] transition-colors relative z-10"
                                            >
                                                Explore More Auctions
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bidders List */}
                            <div className="flex flex-col bg-white border border-[#EAECF3] rounded-[10px] overflow-hidden shadow-sm">
                                <div className="bg-[#2E3D83] h-[60px] flex items-center px-6">
                                    <h3 className="text-white text-[16px] font-bold uppercase tracking-tight">Bidders List</h3>
                                </div>
                                <div className="p-2 flex flex-col divide-y divide-[#EAECF3]">
                                    {bids.length === 0 ? (
                                        <div className="p-8 text-center text-[#A0A0A0] italic text-sm">No bids yet. Start the auction!</div>
                                    ) : (
                                        bids.map((bid, i) => (
                                            <div key={`${bid._id}-${i}`} className="p-4 flex items-center justify-between hover:bg-[#F1F2FF] transition-colors rounded-lg group">
                                                <div className="flex flex-col">
                                                    <span className={`text-[14px] font-bold ${i === 0 ? "text-[#2E3D83]" : "text-[#545677]"}`}>
                                                        {bid.user ? `${bid.user.firstName} ${bid.user.lastName}` : `Bidder ${i + 1}`}
                                                    </span>
                                                    <span className="text-[10px] text-[#A0A0A0] uppercase font-bold">{new Date(bid.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                                <span className={`text-[16px] font-bold ${i === 0 ? "text-[#EF233C]" : "text-[#2E3D83]"}`}>
                                                    {formatCurrency(bid.amount)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
