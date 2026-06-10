"use client";
import { useState, useEffect } from "react";
import AuctionCard from "./auction-card";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export default function LiveAuction() {
    const { user } = useAppSelector((state) => state.auth);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const { data } = await api.get("/cars?status=live");
                setAuctions(data.slice(0, 4)); // Show only top 4 for landing page
            } catch (err) {
                console.error("Failed to fetch live auctions:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAuctions();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <section className="bg-[#2E3D83] my-10 lg:my-[60px] py-24 w-full px-5 md:px-10 lg:px-[117px] relative overflow-hidden">
            {/* Header Area */}
            <div className="max-w-[1440px] mx-auto text-center mb-16">
                <div className="flex flex-col items-center gap-6">
                    <h2 className="text-[40px] md:text-[48px] font-bold text-white font-[family-name:var(--font-sans)] leading-tight uppercase tracking-wide">
                        Live Auction
                    </h2>
                    <div className="relative w-[340px] h-[1px] bg-white/40">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#F9B610] rotate-45 border-2 border-[#2E3D83]" />
                    </div>
                </div>

                <div className="flex justify-start mt-14 border-b border-white/20 pb-0.5">
                    <button className="text-white text-[20px] font-bold pb-4 border-b-4 border-[#F9C146] transition-all px-2 uppercase tracking-wide">
                        Live Auction
                    </button>
                </div>
            </div>

            {/* Auction Cards Grid */}
            <div className="max-w-[1440px] mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-white">
                        <Loader2 className="animate-spin" size={48} />
                        <p className="font-bold text-xl">Loading live auctions...</p>
                    </div>
                ) : auctions.length === 0 ? (
                    <div className="text-center py-20 text-white/60 bg-white/5 rounded-lg border-2 border-dashed border-white/10">
                        <p className="font-medium text-lg">No active auctions at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 group/grid">
                        {auctions.map((car) => (
                            <AuctionCard
                                key={car._id}
                                id={car._id}
                                name={car.title}
                                image={car.images?.[0] || "/placeholder-car.webp"}
                                currentBid={formatCurrency(car.currentBid)}
                                endTime="10 : 20 : 47"
                                bidCount={car.bidCount || 0}
                                isTrending={car.currentBid > 50000}
                                isOwner={user?.id === car.uploadedBy?._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
