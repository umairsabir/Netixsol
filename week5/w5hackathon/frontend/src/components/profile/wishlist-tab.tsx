"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Hammer, Star, Loader2, Heart } from "lucide-react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleWishlistItem } from "@/store/slices/wishlistSlice";
import toast from "react-hot-toast";

export default function WishlistTab() {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { items: wishlistIds } = useAppSelector((state) => state.wishlist);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const { data } = await api.get("/wishlist");
                setWishlist(data);
            } catch (err) {
                console.error("Failed to fetch wishlist:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWishlist();
    }, []);

    const toggleWishlist = async (carId: string, itemId: string) => {
        try {
            dispatch(toggleWishlistItem(carId)); // Sync Redux
            await api.post(`/wishlist/${carId}`);
            setWishlist(prev => prev.filter(item => item._id !== itemId));
            toast.success("Removed from wishlist");
        } catch (err) {
            dispatch(toggleWishlistItem(carId)); // Rollback Redux
            console.error("Failed to update wishlist:", err);
            toast.error("Failed to remove from wishlist");
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#2E3D83]" size={40} /></div>;

    return (
        <div className="animate-in fade-in duration-500">
            <h2 className="text-[24px] font-bold text-[#2E3D83] mb-6 font-[family-name:var(--font-sans)]">
                My Wishlist
            </h2>

            {wishlist.length === 0 ? (
                <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 py-20 text-center">
                    <p className="text-gray-500 font-medium">Your wishlist is empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => {
                        const carData = item.car;
                        if (!carData) return null; // Skip if car was deleted

                        return (
                            <div
                                key={item._id}
                                className="bg-white border border-[#EAECF3] rounded-[5px] overflow-hidden flex flex-col group hover:shadow-xl transition-all"
                            >
                                <div className="relative w-full h-[150px] bg-gray-100 overflow-hidden cursor-pointer" onClick={() => router.push(`/car/${carData._id}`)}>
                                    {carData.status === 'live' && (
                                    <div className="absolute left-0 top-0 z-10 bg-[#EF233C] text-white px-2 py-1 rounded-br-[4px] flex items-center gap-1 shadow-sm">
                                        <Hammer size={12} className="rotate-[20deg]" />
                                        <span className="text-[10px] font-semibold uppercase tracking-wider">Live</span>
                                    </div>
                                )}
                                    <Image
                                        src={carData.images?.[0] || "/placeholder-car.webp"}
                                        alt={carData.title || "Car Image"}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleWishlist(carData._id, item._id); }}
                                        className="absolute right-3 top-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Heart size={14} className="fill-current" />
                                    </button>
                            </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3
                                            onClick={() => router.push(`/car/${carData._id}`)}
                                            className="text-[16px] font-bold text-[#2E3D83] cursor-pointer hover:underline truncate"
                                        >
                                            {carData.title}
                                        </h3>
                                        <div className="flex gap-[2px]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} className="fill-[#F9C146] text-[#F9C146]" />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-[#939393] leading-relaxed mb-4 line-clamp-2">
                                        {carData.description || "No description available for this vehicle."}
                                    </p>

                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[12px] font-bold text-[#2E3D83]">${carData.currentBid?.toLocaleString()}</span>
                                            <span className="text-[10px] text-[#939393]">Current Bid</span>
                                        </div>
                                        <div className="flex flex-col gap-1 text-right">
                                            <span className="text-[12px] font-bold text-[#2E3D83] uppercase">{carData.status}</span>
                                            <span className="text-[10px] text-[#939393]">Status</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/car/${carData._id}`)}
                                        className="w-full h-[40px] border border-[#2E3D83] text-[#2E3D83] text-[16px] font-bold rounded-[5px] hover:bg-[#2E3D83] hover:text-white transition-all mt-auto shadow-sm"
                                    >
                                        View Auction
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
