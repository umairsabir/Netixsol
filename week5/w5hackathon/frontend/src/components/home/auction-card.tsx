"use client";
import Image from "next/image";
import { Hammer, Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleWishlistItem } from "@/store/slices/wishlistSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface AuctionCardProps {
    id: string;
    name: string;
    image: string;
    currentBid: string;
    endTime: string;
    bidCount: number;
    isTrending?: boolean;
    isOwner?: boolean;
}

import Link from "next/link";

export default function AuctionCard({
    id,
    name,
    image,
    currentBid,
    endTime,
    bidCount,
    isTrending = false,
    isOwner = false
}: AuctionCardProps) {
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
        <div className="group relative bg-white border border-[#A9A9A9] rounded-[5px] overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Header / Trending Tag & Favorite Star */}
            <div className="relative h-[65px] flex items-center justify-between px-2.5 border-b border-[#DEDEDE]">
                {/* Trending Tag */}
                <div className="absolute left-0 top-0 z-20">
                    {isTrending && (
                        <div className="flex items-center gap-1 bg-[#EF233C] text-white px-2 py-1.5 rounded-br-[4px] shadow-sm">
                            <Hammer size={12} className="rotate-[20deg]" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Trending</span>
                        </div>
                    )}
                </div>

                {/* Car Name - Centered */}
                <h3 className="w-full text-[16px] font-bold text-black text-center font-[family-name:var(--font-sans)]">
                    {name}
                </h3>

                {/* Heart Icon - Circular */}
                <div className="absolute right-2.5 top-0.5 z-20">
                    <button 
                        onClick={handleToggleWishlist}
                        className={`w-9 h-9 rounded-full ${isWishlisted ? "bg-[#EF233C] text-white" : "bg-white text-[#2E3D83]"} shadow-[0_0_4px_rgba(0,0,0,0.25)] flex items-center justify-center hover:scale-105 transition-all transform active:scale-95 group/fav`}
                    >
                        <Heart size={16} className={isWishlisted ? "fill-white" : "group-hover/fav:fill-[#EF233C]"} />
                    </button>
                </div>
            </div>

            {/* Image Section - Generous Padding for Car */}
            <div className="relative w-full h-[180px] bg-white p-6 overflow-hidden">
                <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out">
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Bid & Time Info */}
            <div className="px-5 py-5 flex items-center justify-between gap-4 border-t border-[#DEDEDE]/50">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[16px] font-bold text-black">{currentBid}</span>
                    <span className="text-[14px] font-medium text-[#7a7a7a]">Current Bid</span>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-right">
                    <span className="text-[16px] font-bold text-black">{endTime}</span>
                    <span className="text-[14px] font-medium text-[#7a7a7a]">
                        {bidCount > 0 ? `${bidCount} ${bidCount === 1 ? "Bidder" : "Bidders"}` : "No Bidders Yet"}
                    </span>
                </div>
            </div>

            {/* CTA Button */}
            <div className="px-5 pb-6">
                <Link href={`/car/${id}`}>
                    <button className={`w-full h-[46px] ${isOwner ? "bg-[#2E3D83]/10 text-[#2E3D83] border border-[#2E3D83]" : "bg-[#2E3D83] text-white"} text-[18px] font-bold rounded-[5px] hover:bg-opacity-95 transition-all shadow-md active:scale-[0.98] transform group-hover:translate-y-[-2px] uppercase tracking-wide`}>
                        {isOwner ? "View Details" : "Submit A Bid"}
                    </button>
                </Link>
            </div>
        </div>
    );
}
