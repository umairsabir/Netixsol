"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Hammer, Star, Loader2, Clock, Trophy, XCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useCountdown } from "@/hooks/use-countdown";

function CountdownTimer({ endDate, status }: { endDate?: string | Date, status: string }) {
    const timeLeft = useCountdown(endDate);

    if (status !== 'live' || timeLeft.isExpired) {
        return <span className="text-[12px] font-bold text-[#EF233C] uppercase tracking-wider">Auction Ended</span>;
    }

    return (
        <div className="flex gap-1">
            {[
                { label: 'D', value: timeLeft.days },
                { label: 'H', value: timeLeft.hours },
                { label: 'M', value: timeLeft.minutes }
            ].map((item, i) => (
                <div key={i} className="w-8 h-8 border border-[#EAECF3] rounded flex flex-col items-center justify-center bg-white shadow-sm">
                    <span className="text-[10px] font-bold text-[#2E3D83] leading-none">{item.value}</span>
                    <span className="text-[6px] text-[#939393] uppercase font-bold">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function MyBidsTab() {
    const [bidData, setBidData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchMyBids = async () => {
            try {
                const { data } = await api.get("/bids/user/mine");
                // Group by car to show unique cars with the latest bid info
                const uniqueCars = data.reduce((acc: any[], bid: any) => {
                    const existing = acc.find(item => item.car._id === bid.car._id);
                    if (!existing) {
                        acc.push(bid);
                    } else if (new Date(bid.createdAt) > new Date(existing.createdAt)) {
                        const index = acc.indexOf(existing);
                        acc[index] = bid;
                    }
                    return acc;
                }, []);
                setBidData(uniqueCars);
            } catch (err) {
                console.error("Failed to fetch my bids:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyBids();
    }, []);

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#2E3D83]" size={40} /></div>;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-[24px] font-bold text-[#2E3D83] font-[family-name:var(--font-sans)] uppercase tracking-wider border-b-2 border-[#F9C146] inline-block pb-1">
                    My Bids History
                </h2>
                <div className="flex gap-2">
                   <div className="flex items-center gap-2 px-3 py-1 bg-[#F1F2FF] rounded-full border border-[#2E3D83]/10">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-[#2E3D83] uppercase">Real-time Updates</span>
                   </div>
                </div>
            </div>

            {bidData.length === 0 ? (
                <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 py-20 text-center">
                    <p className="text-gray-500 font-medium">You haven&apos;t placed any bids yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bidData.map((bid) => {
                        const car = bid.car;
                        const isWinning = bid.amount >= car.currentBid;
                        const isEnded = car.status !== 'live';
                        
                        let statusConfig = {
                            label: isWinning ? "Winning" : "Outbid",
                            color: isWinning ? "bg-green-500" : "bg-[#EF233C]",
                            icon: isWinning ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />
                        };

                        if (isEnded) {
                            statusConfig = {
                                label: isWinning ? "Auction Won" : "Lost",
                                color: isWinning ? "bg-[#2E3D83]" : "bg-gray-400",
                                icon: isWinning ? <Trophy size={12} /> : <XCircle size={12} />
                            };
                        }

                        return (
                            <div
                                key={bid._id}
                                className={`bg-white border border-[#EAECF3] rounded-[8px] overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300 relative ${isEnded && !isWinning ? 'opacity-80 grayscale-[0.3]' : ''}`}
                            >
                                {/* Header: Car Title */}
                                <div className="p-4 text-center border-b border-[#EAECF3] bg-gray-50/50">
                                    <h3 className="text-[16px] font-bold text-[#2E3D83] truncate px-4">
                                        {car.title}
                                    </h3>
                                </div>

                                {/* Image Section */}
                                <div className="relative w-full h-[180px] bg-white overflow-hidden border-b border-[#EAECF3]">
                                    {/* Status Badge */}
                                    <div className={`absolute left-0 top-3 z-10 ${statusConfig.color} text-white px-3 py-1 rounded-r-full shadow-lg flex items-center gap-2 transform -translate-x-1 group-hover:translate-x-0 transition-transform`}>
                                        {statusConfig.icon}
                                        <span className="text-[10px] font-black uppercase tracking-tighter">{statusConfig.label}</span>
                                    </div>

                                    <Image
                                        src={car.images?.[0] || "/placeholder-car.webp"}
                                        alt={car.title}
                                        fill
                                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>

                                {/* Content Section */}
                                <div className="p-5">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className={`rounded-[5px] p-3 text-center transition-colors ${isWinning ? 'bg-green-50 border border-green-100' : 'bg-[#F1F2FF]'}`}>
                                            <span className={`block text-[16px] font-black ${isWinning ? 'text-green-600' : 'text-[#2E3D83]'}`}>${car.currentBid?.toLocaleString()}</span>
                                            <span className="block text-[9px] text-[#939393] uppercase font-bold tracking-widest mt-1">Winning Bid</span>
                                        </div>
                                        <div className={`rounded-[5px] p-3 text-center border ${!isWinning ? 'bg-red-50 border-red-100' : 'bg-[#F1F2FF] border-transparent'}`}>
                                            <span className={`block text-[16px] font-black ${!isWinning ? 'text-[#EF233C]' : 'text-[#2E3D83]'}`}>${bid.amount?.toLocaleString()}</span>
                                            <span className="block text-[9px] text-[#939393] uppercase font-bold tracking-widest mt-1">Your Bid</span>
                                        </div>
                                    </div>

                                    {/* Timer and Bids Info */}
                                    <div className="flex justify-between items-center mb-6 pt-4 border-t border-[#F1F2FF]">
                                        <div className="flex flex-col gap-1">
                                            <CountdownTimer endDate={car.auctionEndDate} status={car.status} />
                                            {car.status === 'live' && <span className="text-[10px] text-[#939393] font-bold uppercase tracking-tight">Remaining Time</span>}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1">
                                                <Hammer size={14} className="text-[#F9C146]" />
                                                <span className="text-[16px] font-black text-[#2E3D83]">{car.bidCount || 0}</span>
                                            </div>
                                            <span className="text-[10px] text-[#939393] font-bold uppercase tracking-tight">Total Bids</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/car/${car._id}`)}
                                        className={`w-full h-11 text-[14px] font-black rounded-[5px] transition-all shadow-md active:scale-[0.98] uppercase tracking-widest ${isEnded ? 'bg-white border-2 border-[#2E3D83] text-[#2E3D83] hover:bg-[#F1F2FF]' : 'bg-[#2E3D83] text-white hover:bg-[#1a2555]'}`}
                                    >
                                        {isEnded ? "View Full Results" : "Increase My Bid"}
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
