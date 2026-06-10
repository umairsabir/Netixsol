"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Hammer, Loader2, Plus, HammerIcon } from "lucide-react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function MyCarsTab() {
    const [cars, setCars] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchMyCars = async () => {
        try {
            const { data } = await api.get("/cars/mine");
            setCars(data);
        } catch (err) {
            console.error("Failed to fetch my cars:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyCars();
    }, []);

    const handleEndBid = async (e: React.MouseEvent, carId: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to end this auction?")) return;
        try {
            await api.post(`/cars/${carId}/end`);
            fetchMyCars(); // Refresh list
        } catch (err) {
            console.error("Failed to end auction:", err);
            alert("Failed to end auction. Please try again.");
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#2E3D83]" size={40} /></div>;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-10 border-b-2 border-[#F9C146] pb-1 inline-block">
                <h2 className="text-[24px] font-bold text-[#2E3D83] font-[family-name:var(--font-sans)] uppercase tracking-wider">
                    My Cars
                </h2>
            </div>

            {cars.length === 0 ? (
                <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 py-20 text-center">
                    <p className="text-gray-500 font-medium">You haven&apos;t listed any cars yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cars.map((car) => (
                        <div
                            key={car._id}
                            onClick={() => router.push(`/car/${car._id}`)}
                            className="bg-white border border-[#EAECF3] rounded-[8px] overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300 relative"
                        >
                            {/* Header: Car Title */}
                            <div className="p-4 text-center border-b border-[#EAECF3]">
                                <h3 className="text-[18px] font-bold text-[#2E3D83] truncate px-4">
                                    {car.title}
                                </h3>
                            </div>

                            {/* Image Section */}
                            <div className="relative w-full h-[180px] bg-gray-50 overflow-hidden">
                                {car.status === 'live' && (
                                    <div className="absolute left-0 top-0 z-10 bg-[#EF233C] text-white px-3 py-1 rounded-br-[4px] flex items-center gap-1 shadow-md">
                                        <HammerIcon size={12} className="rotate-[20deg]" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Trending</span>
                                    </div>
                                )}
                                <Image
                                    src={car.images?.[0] || "/placeholder-car.webp"}
                                    alt={car.title}
                                    fill
                                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>

                            {/* Content Section */}
                            <div className="p-6">
                                {/* Stats Box */}
                                <div className="bg-[#F1F2FF] rounded-[5px] p-4 flex justify-between items-center mb-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[16px] font-bold text-[#2E3D83] leading-none">${car.currentBid?.toLocaleString()}</span>
                                        <span className="text-[11px] text-[#939393] uppercase font-medium">Winning Bid</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-right">
                                        <span className="text-[14px] font-bold text-[#2E3D83] leading-none">{car.bidCount || 0}</span>
                                        <span className="text-[10px] text-[#939393] uppercase font-medium">Total Bids</span>
                                    </div>
                                </div>

                                {car.status === 'live' ? (
                                    <button
                                        onClick={(e) => handleEndBid(e, car._id)}
                                        className="w-full h-11 bg-[#2E3D83] text-white text-[16px] font-bold rounded-[5px] hover:bg-[#1a2555] transition-all shadow-md active:scale-[0.98]"
                                    >
                                        End Bid
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full h-11 bg-[#F1F2FF] text-[#939393] text-[16px] font-bold rounded-[5px] cursor-not-allowed uppercase tracking-widest"
                                    >
                                        Sold
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
