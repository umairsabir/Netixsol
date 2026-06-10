"use client";
import Image from "next/image";
import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
    const router = useRouter();
    const [filters, setFilters] = useState({
        make: "",
        model: "",
        year: "",
        price: ""
    });

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (filters.make) params.append("make", filters.make);
        if (filters.model) params.append("model", filters.model);
        if (filters.year) params.append("year", filters.year);
        if (filters.price) params.append("maxPrice", filters.price);
        router.push(`/auction?${params.toString()}`);
    };

    return (
        <div className="relative w-full h-[685px] overflow-hidden">
            <Image
                src="/hero-bg.png"
                alt="Luxury SUV in Snowy Mountains"
                fill
                priority
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />

            <div className="relative z-10 max-w-[1440px] mx-auto px-[118px] h-full flex flex-col justify-center pt-[50px] max-lg:px-8 max-sm:px-5">
                <div className="bg-[#BBD0F6] w-fit px-4 py-2.5 rounded-[5px] mb-6 shadow-sm border border-white/20">
                    <span className="text-[#2E3D83] font-bold text-base tracking-wide uppercase">
                        Welcome to Auction
                    </span>
                </div>

                <h1 className="font-display font-bold text-[74px] leading-[74px] text-white max-w-[600px] mb-4 max-sm:text-[48px] max-sm:leading-[48px] drop-shadow-lg">
                    Find Your <br /> Dream Car
                </h1>

                <p className="text-[#E0E0E0] text-lg max-w-[447px] mb-12 font-medium leading-relaxed">
                    Browse our exclusive collection of luxury vehicles. Discover performance, comfort, and style in every auction.
                </p>

                <div className="absolute bottom-[40px] left-[118px] right-[118px] max-lg:left-8 max-lg:right-8 max-sm:left-5 max-sm:right-5">
                    <div className="bg-white rounded-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-2 flex items-center gap-3 max-md:flex-col max-md:items-stretch h-20 max-md:h-auto border border-white/10 backdrop-blur-sm">
                        
                        {/* Make Column */}
                        <div className="flex-1 px-4 flex flex-col justify-center border-r border-gray-100 h-full relative">
                            {filters.make && (
                                <span className="text-[12px] text-[#9A9A9A] font-semibold uppercase tracking-wider mb-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">Make</span>
                            )}
                            <div className="relative flex items-center w-full">
                                <select 
                                    value={filters.make}
                                    onChange={(e) => setFilters(prev => ({ ...prev, make: e.target.value }))}
                                    className={`w-full focus:outline-none bg-transparent cursor-pointer appearance-none pr-6 transition-all duration-200 ${!filters.make ? "text-[#9A9A9A] font-semibold text-base" : "text-black font-bold text-base"}`}
                                >
                                    <option value="">Make</option>
                                    <option value="Audi">Audi</option>
                                    <option value="BMW">BMW</option>
                                    <option value="Porsche">Porsche</option>
                                    <option value="Mazda">Mazda</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-0 text-black pointer-events-none" />
                            </div>
                        </div>

                        {/* Model Column */}
                        <div className="flex-1 px-4 flex flex-col justify-center border-r border-gray-100 h-full relative">
                            {filters.model && (
                                <span className="text-[12px] text-[#9A9A9A] font-semibold uppercase tracking-wider mb-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">Model</span>
                            )}
                            <div className="relative flex items-center w-full">
                                <select 
                                    value={filters.model}
                                    onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
                                    className={`w-full focus:outline-none bg-transparent cursor-pointer appearance-none pr-6 transition-all duration-200 ${!filters.model ? "text-[#9A9A9A] font-semibold text-base" : "text-black font-bold text-base"}`}
                                >
                                    <option value="">Model</option>
                                    <option value="A4">A4</option>
                                    <option value="X5">X5</option>
                                    <option value="911">911</option>
                                    <option value="MX-5">MX-5</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-0 text-black pointer-events-none" />
                            </div>
                        </div>

                        {/* Year Column */}
                        <div className="flex-1 px-4 flex flex-col justify-center border-r border-gray-100 h-full relative">
                            {filters.year && (
                                <span className="text-[12px] text-[#9A9A9A] font-semibold uppercase tracking-wider mb-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">Year</span>
                            )}
                            <div className="relative flex items-center w-full">
                                <select 
                                    value={filters.year}
                                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                                    className={`w-full focus:outline-none bg-transparent cursor-pointer appearance-none pr-6 transition-all duration-200 ${!filters.year ? "text-[#9A9A9A] font-semibold text-base" : "text-black font-bold text-base"}`}
                                >
                                    <option value="">Year</option>
                                    <option value="2024">2024</option>
                                    <option value="2023">2023</option>
                                    <option value="2022">2022</option>
                                    <option value="2021">2021</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-0 text-black pointer-events-none" />
                            </div>
                        </div>

                        {/* Price Column */}
                        <div className="flex-1 min-w-[195px] px-4 flex flex-col justify-center h-full relative">
                            {filters.price && (
                                <span className="text-[12px] text-[#9A9A9A] font-semibold uppercase tracking-wider mb-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">Price</span>
                            )}
                            <div className="relative flex items-center w-full">
                                <select 
                                    value={filters.price}
                                    onChange={(e) => setFilters(prev => ({ ...prev, price: e.target.value }))}
                                    className={`w-full focus:outline-none bg-transparent cursor-pointer appearance-none pr-10 transition-all duration-200 ${!filters.price ? "text-[#9A9A9A] font-semibold text-base" : "text-black font-bold text-base"}`}
                                >
                                    <option value="">Price</option>
                                    <option value="50000">Up to $50,000</option>
                                    <option value="100000">Up to $100,000</option>
                                    <option value="200000">Up to $200,000</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-0 text-black pointer-events-none" />
                            </div>
                        </div>

                        <button 
                            onClick={handleSearch}
                            className="bg-[#2E3D83] text-white h-full w-full md:w-[320px] px-6 rounded-[8px] flex items-center justify-start gap-4 transition-all hover:bg-[#1e2a5a] max-md:py-4 active:scale-95 shadow-[0_4px_10px_rgba(46,61,131,0.25)] cursor-pointer"
                        >
                            <Search size={24} strokeWidth={2} className="opacity-95" />
                            <span className="text-[20px] font-medium tracking-wide">Search</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
