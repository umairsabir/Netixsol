"use client";
import Image from "next/image";
import { Hammer, Heart, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleWishlistItem } from "@/store/slices/wishlistSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useCountdown } from "@/hooks/use-countdown";

interface AuctionListItemProps {
    id: string;
    name: string;
    image: string;
    currentBid: string;
    totalBids: string;
    endDate?: string | Date;
    endTime: string;
    isTrending?: boolean;
    rating?: number;
    isOwner?: boolean;
}

import Link from "next/link";

export default function AuctionListItem({
    id,
    name,
    image,
    currentBid,
    totalBids,
    endDate,
    endTime,
    isTrending = false,
    rating = 5,
    isOwner = false
}: AuctionListItemProps) {
    const timeLeft = useCountdown(endDate);
    const dispatch = useAppDispatch();
    const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
    const { user } = useAppSelector((state) => state.auth);
    const isWishlisted = wishlistItems.includes(id);

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Please login to add to wishlist", { id: "wishlist-login-error" });
            return;
        }

        try {
            dispatch(toggleWishlistItem(id)); // Optimistic update
            const { data } = await api.post(`/wishlist/${id}`);
            if (data.status === 'added') {
                toast.success("Added to wishlist");
            } else {
                toast.success("Removed from wishlist");
            }
        } catch (err) {
            dispatch(toggleWishlistItem(id)); // Rollback
            toast.error("Failed to update wishlist");
        }
    };
    return (
        <div className="group relative bg-white border border-[#EAECF3] rounded-[5px] overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-500 mb-8 w-full min-h-[196px]">
            {/* Left: Image Container - Rectangle 17539 style */}
            <div className="relative w-full md:w-[245px] h-[196px] bg-white overflow-hidden flex-shrink-0">
                {isTrending && (
                    <div className="absolute left-0 top-0 z-10 bg-[#EF233C] text-white px-2 py-1 rounded-br-[4px] flex items-center gap-1 shadow-sm">
                        <Hammer size={12} className="rotate-[20deg]" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Trending</span>
                    </div>
                )}
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
            </div>

            {/* Right: Content Area - White Section */}
            <div className="flex-1 flex flex-col relative">
                {/* Heart Icon - Component 126 / Ellipse 74 */}
                <div className="absolute right-4 top-2 pointer-events-none md:pointer-events-auto">
                    <button 
                        onClick={handleToggleWishlist}
                        className={`w-10 h-10 rounded-full ${isWishlisted ? "bg-[#EF233C] text-white" : "bg-[#EAECF3]/60 text-[#2E3D83]"} flex items-center justify-center hover:scale-110 transition-all transform active:scale-95 group/fav`}
                    >
                        <Heart size={16} className={isWishlisted ? "fill-white" : "group-hover/fav:fill-[#EF233C]"} />
                    </button>
                </div>

                <div className="p-5 flex flex-col md:flex-row gap-6 h-full">
                    {/* Column 1: Main Details */}
                    <div className="flex-[1.2] flex flex-col pt-1">
                        <div className="mb-2">
                            <h3 className="text-[20px] font-bold text-[#2E3D83] font-[family-name:var(--font-sans)] leading-tight">{name}</h3>
                            {/* Yellow Accent Line - Rectangle 17540 */}
                            <div className="w-[80px] h-[3px] bg-[#F4C23D] rounded-[4px] mt-2" />
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={14} className="fill-[#F9C146] text-[#F9C146]" />
                            ))}
                        </div>

                        <p className="text-[14px] font-medium text-[#939393] leading-relaxed mb-1">
                            Lorem ipsum dolor sit amet consectetur. Velit amet aenean sed nunc. Malesuada dignissim viverra praesent aenean nulla mattiszxxzxzxz....
                            <button className="ml-1 text-[12px] font-bold text-[#2E3D83] hover:underline uppercase tracking-wide">
                                View Details
                            </button>
                        </p>
                    </div>

                    {/* Column 2: Pricing & Timer */}
                    <div>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 flex flex-col justify-start md:border-x md:border-[#EAECF3]/50 md:px-6">
                                <div className="mb-3">
                                    <span className="text-[14px] font-bold text-[#2E3D83] block leading-none">{currentBid}</span>
                                    <span className="text-[12px] font-medium text-[#939393] uppercase tracking-wide mt-1 block">Current Bid</span>
                                </div>

                                {/* Timer Grid */}
                                <div className="flex gap-1.5 mb-1.5 overflow-visible">
                                    {[
                                        { label: 'days', value: timeLeft.days },
                                        { label: 'hours', value: timeLeft.hours },
                                        { label: 'mins', value: timeLeft.minutes },
                                        { label: 'secs', value: timeLeft.seconds }
                                    ].map((item) => (
                                        <div key={item.label} className="flex flex-col items-center bg-white border border-[#2E3D83]/20 rounded-[2px] p-1.5 min-w-[36px] shadow-[0_0_2px_rgba(0,0,0,0.05)]">
                                            <span className="text-[10px] font-bold text-[#2E3D83] leading-none mb-0.5">{item.value}</span>
                                            <span className="text-[7px] font-medium text-[#939393] uppercase tracking-tighter">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-[0.1em] mt-1 ms-1 ${timeLeft.isExpired ? 'text-red-500' : 'text-[#939393]'}`}>
                                    {timeLeft.isExpired ? 'Auction Ended' : 'Time Left'}
                                </span>
                            </div>

                            {/* Column 3: Bids & End Time */}
                            <div className="flex-1 flex flex-col items-start justify-start md:pe-2">
                                <div className="mb-3">
                                    <span className="text-[14px] font-bold text-[#2E3D83] block leading-none">{totalBids}</span>
                                    <span className="text-[12px] font-medium text-[#939393] uppercase tracking-wide mt-1 block">Total Bids</span>
                                </div>

                                <div className="">
                                    <span className="text-[14px] font-bold text-[#2E3D83] block leading-none">{endTime}</span>
                                    <span className="text-[12px] font-medium text-[#939393] uppercase tracking-wide mt-1 block">End Time</span>
                                </div>
                            </div>
                        </div>
                        {/* Bottom Action: Submit A Bid Button - Rectangle 17516 */}
                        <div className="px-5 pt-4 pb-5 md:pl-0 md:flex md:justify-end">
                            <Link href={`/car/${id}`}>
                                <button className={`w-full md:w-[420px] h-[46px] border border-[#2E3D83] rounded-[5px] ${isOwner ? "bg-[#2E3D83]/10 text-[#2E3D83]" : "text-[#2E3D83] hover:bg-[#2E3D83] hover:text-white"} text-[18px] font-bold transition-all transform active:scale-[0.98] mt-auto uppercase tracking-wide`}>
                                    {isOwner ? "View Details" : "Submit A Bid"}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}
