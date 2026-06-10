"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Loader2, Calendar, Car, Mail } from "lucide-react";
import PageHero from "@/components/common/page-hero";
import AuctionListItem from "@/components/auction/auction-list-item";
import api from "@/lib/axios";
import { useAppSelector } from "@/store/hooks";

export default function PublicProfilePage() {
    const params = useParams();
    const userId = params.id as string;
    const { user: currentUser } = useAppSelector((state) => state.auth);

    const [user, setUser] = useState<any>(null);
    const [cars, setCars] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, carsRes] = await Promise.all([
                    api.get(`/users/${userId}`),
                    api.get(`/cars/user/${userId}`)
                ]);
                setUser(userRes.data);
                setCars(carsRes.data);
            } catch (err) {
                console.error("Failed to fetch public profile:", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (userId) fetchData();
    }, [userId]);

    const formatBid = (amount: number) => {
        return `$${amount.toLocaleString()}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[#2E3D83]" size={48} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-[#2E3D83]">
                <h1 className="text-4xl font-bold font-josefin">User Not Found</h1>
                <p className="text-gray-500">The profile you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FDFDFD] pb-40">
            <PageHero
                title={`${user.firstName}'s Profile`}
                subtitle="View this user's active auctions and history."
                breadcrumbs={[{ label: "Home", href: "/" }, { label: "User Profile" }]}
            />

            <div className="container mx-auto px-4 lg:px-[118px] py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar / Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 flex flex-col items-center sticky top-24">
                            <div className="w-32 h-32 bg-[#2E3D83] rounded-full flex items-center justify-center text-white text-4xl font-bold mb-6">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <h2 className="text-2xl font-bold text-[#2E3D83] mb-1">{user.firstName} {user.lastName}</h2>
                            <p className="text-gray-500 mb-8 font-medium">Auto Enthusiast</p>

                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[#2E3D83]">
                                        <Calendar size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Joined</span>
                                        <span className="text-sm font-bold text-[#2E3D83]">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[#2E3D83]">
                                        <Car size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Listings</span>
                                        <span className="text-sm font-bold text-[#2E3D83]">{cars.length} Vehicles</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100">
                            <h3 className="text-2xl font-bold text-[#2E3D83] font-josefin uppercase tracking-wide">
                                Active & Past Auctions
                            </h3>
                            <div className="flex gap-2">
                                <span className="px-4 py-1 bg-[#2E3D83]/10 text-[#2E3D83] rounded-full text-xs font-bold uppercase tracking-wider">
                                    Live ({cars.filter(c => c.status === 'live').length})
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {cars.length === 0 ? (
                                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl py-20 px-8 text-center">
                                    <p className="text-gray-400 font-bold text-lg italic">This user hasn't listed any cars yet.</p>
                                </div>
                            ) : (
                                cars.map((car) => (
                                    <AuctionListItem
                                        key={car._id}
                                        id={car._id}
                                        name={car.title}
                                        image={car.images?.[0] || "/placeholder-car.webp"}
                                        currentBid={formatBid(car.currentBid)}
                                        totalBids={(car.bidCount || 0).toString()}
                                        endDate={car.auctionEndDate}
                                        endTime={new Date(car.auctionEndDate || Date.now()).toLocaleTimeString()}
                                        isTrending={false}
                                        rating={5}
                                        isOwner={currentUser?.id === car.uploadedBy?._id || currentUser?.id === car.uploadedBy}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
