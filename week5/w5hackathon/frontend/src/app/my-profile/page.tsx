"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageHero from "@/components/common/page-hero";
import PersonalInfoTab from "@/components/profile/personal-info-tab";
import MyCarsTab from "@/components/profile/my-cars-tab";
import MyBidsTab from "@/components/profile/my-bids-tab";
import WishlistTab from "@/components/profile/wishlist-tab";

type TabType = "personal" | "my-cars" | "my-bids" | "wishlist";

function ProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get("tab") as TabType;
    const [activeTab, setActiveTab] = useState<TabType>("personal");

    useEffect(() => {
        if (tabParam && ["personal", "my-cars", "my-bids", "wishlist"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        router.push(`/my-profile?tab=${tab}`, { scroll: false });
    };

    return (
        <div className="container mx-auto px-4 lg:px-[118px] py-10">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-[286px] flex flex-col gap-4">
                    <button 
                        onClick={() => handleTabChange("personal")}
                        className={`w-full h-10 flex items-center px-4 rounded-[5px] transition-colors ${activeTab === 'personal' ? 'bg-[#F1F2FF] text-[#2E3D83] font-semibold border border-transparent border-l-4 border-l-[#F9C146]' : 'bg-white text-[#2E3D83] font-normal border border-[#EAECF3] hover:bg-gray-50'}`}
                    >
                        Personal Information
                    </button>
                    <button 
                        onClick={() => handleTabChange("my-cars")}
                        className={`w-full h-10 flex items-center px-4 rounded-[5px] transition-colors ${activeTab === 'my-cars' ? 'bg-[#F1F2FF] text-[#2E3D83] font-semibold border border-transparent border-l-4 border-l-[#F9C146]' : 'bg-white text-[#2E3D83] font-normal border border-[#EAECF3] hover:bg-gray-50'}`}
                    >
                        My Cars
                    </button>
                    <button 
                        onClick={() => handleTabChange("my-bids")}
                        className={`w-full h-10 flex items-center px-4 rounded-[5px] transition-colors ${activeTab === 'my-bids' ? 'bg-[#F1F2FF] text-[#2E3D83] font-semibold border border-transparent border-l-4 border-l-[#F9C146]' : 'bg-white text-[#2E3D83] font-normal border border-[#EAECF3] hover:bg-gray-50'}`}
                    >
                        My Bids
                    </button>
                    <button 
                        onClick={() => handleTabChange("wishlist")}
                        className={`w-full h-10 flex items-center px-4 rounded-[5px] transition-colors ${activeTab === 'wishlist' ? 'bg-[#F1F2FF] text-[#2E3D83] font-semibold border border-transparent border-l-4 border-l-[#F9C146]' : 'bg-white text-[#2E3D83] font-normal border border-[#EAECF3] hover:bg-gray-50'}`}
                    >
                        Wishlist
                    </button>
                </div>

                <div className="flex-1">
                    {activeTab === "personal" && <PersonalInfoTab />}
                    {activeTab === "my-cars" && <MyCarsTab />}
                    {activeTab === "my-bids" && <MyBidsTab />}
                    {activeTab === "wishlist" && <WishlistTab />}
                </div>
            </div>
        </div>
    );
}

export default function MyProfilePage() {
    return (
        <main className="min-h-screen bg-white pb-20">
            <PageHero 
                title="My Profile" 
                subtitle="Lorem ipsum dolor sit amet consectetur. At in pretium semper vitae eu eu mus."
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "My Profile" }
                ]}
            />

            {/* Profile Content Container */}
            <Suspense fallback={<div className="p-20 text-center">Loading Profile...</div>}>
                <ProfileContent />
            </Suspense>
        </main>
    );
}
