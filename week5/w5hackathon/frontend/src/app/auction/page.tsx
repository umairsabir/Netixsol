"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHero from "@/components/common/page-hero";
import AuctionSidebar from "@/components/auction/auction-sidebar";
import AuctionListItem from "@/components/auction/auction-list-item";
import Pagination from "@/components/auction/pagination";
import { ChevronDown, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useAppSelector } from "@/store/hooks";
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

function AuctionPageContent() {
    const { user } = useAppSelector((state) => state.auth);
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            setIsLoading(true);
            try {
                const params = Object.fromEntries(searchParams.entries());
                const { data } = await api.get("/cars", { params });
                setListings(data);
            } catch (error) {
                console.error("Failed to fetch listings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchListings();
    }, [searchParams]);

    const formatBid = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="container mx-auto px-4 lg:px-[118px] py-20 pb-40">
            {/* Result Bar */}
            <div className="bg-[#2E3D83] rounded-[5px] px-8 py-4 flex items-center justify-between mb-12 shadow-sm">
                <span className="text-white text-[16px] font-semibold tracking-wide">
                    {isLoading ? "Loading..." : `Showing ${listings.length} Results`}
                </span>
                <div className="relative group">
                    <button className="bg-white rounded-[3px] px-4 py-2 flex items-center gap-4 cursor-pointer hover:bg-opacity-95 transition-all shadow-sm">
                        <span className="text-[#9A9A9A] text-[12px] font-medium uppercase tracking-tight">Sort By Newness</span>
                        <ChevronDown size={14} className="text-[#2E3D83]" />
                    </button>
                </div>
            </div>

            {/* Main Content: Sidebar + List */}
            <div className="flex flex-col lg:flex-row gap-5 items-start">
                {/* Left Column: Listings */}
                <div className="flex-1 w-full order-2 lg:order-1">
                    <div className="flex flex-col">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#2E3D83]">
                                <Loader2 className="animate-spin" size={48} />
                                <p className="font-bold text-xl">Filtering live auctions...</p>
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium text-lg">No matching auctions found. Try adjusting your filters!</p>
                            </div>
                        ) : (
                            listings.map((car) => (
                                <AuctionListItem
                                    key={car._id}
                                    id={car._id}
                                    name={car.title}
                                    image={car.images[0] || "/placeholder-car.webp"}
                                    currentBid={formatBid(car.currentBid)}
                                    totalBids={(car.bidCount || 0).toString()}
                                    endDate={car.auctionEndDate}
                                    endTime={new Date(car.auctionEndDate || Date.now()).toLocaleTimeString()}
                                    isTrending={car.currentBid > 100000}
                                    rating={5}
                                    isOwner={user && ((user._id || user.id) === (car.uploadedBy?._id || car.uploadedBy))}
                                />
                            ))
                        )}
                    </div>
                    {listings.length > 10 && <Pagination />}
                </div>

                {/* Right Column: Sidebar */}
                <div className="w-full lg:w-[286px] lg:sticky top-24 order-1 lg:order-2">
                    <AuctionSidebar />
                </div>
            </div>
        </div>
    );
}

export default function AuctionPage() {
    return (
        <main className="min-h-screen bg-white">
            <PageHero
                title="Auction"
                subtitle="Browse our collection of premium vehicles and find your next dream car."
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Auction" }
                ]}
            />
            <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#2E3D83]" size={48} /></div>}>
                <AuctionPageContent />
            </Suspense>
        </main>
    );
}
