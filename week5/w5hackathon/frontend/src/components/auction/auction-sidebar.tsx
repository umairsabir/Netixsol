"use client";
import { useState, useEffect, Suspense } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Range, getTrackBackground } from "react-range";

function SidebarContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [filters, setFilters] = useState({
        category: searchParams.get("category") || "",
        paint: searchParams.get("paint") || "",
        make: searchParams.get("make") || "",
        model: searchParams.get("model") || "",
        style: searchParams.get("style") || "",
        minPrice: searchParams.get("minPrice") || "0",
        maxPrice: searchParams.get("maxPrice") || "500000",
    });

    const [rangeValues, setRangeValues] = useState([
        Number(filters.minPrice),
        Number(filters.maxPrice)
    ]);

    // Update range values if search params change externally
    useEffect(() => {
        setRangeValues([
            Number(searchParams.get("minPrice") || "0"),
            Number(searchParams.get("maxPrice") || "500000")
        ]);
    }, [searchParams]);

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (filters.category) params.append("category", filters.category);
        if (filters.paint) params.append("paint", filters.paint);
        if (filters.make) params.append("make", filters.make);
        if (filters.model) params.append("model", filters.model);
        if (filters.style) params.append("category", filters.style);
        if (rangeValues[0] > 0) params.append("minPrice", rangeValues[0].toString());
        params.append("maxPrice", rangeValues[1].toString());
        router.push(`/auction?${params.toString()}`);
    };

    const categories = ["SUV", "Sedan", "Hatchback", "Coupe", "Truck", "Electric"];
    const colors = ["White", "Black", "Silver", "Grey", "Red", "Blue"];
    const makes = ["Toyota", "Honda", "Ford", "BMW", "Mercedes", "Audi", "Tesla"];
    const models = ["Camry", "Civic", "F-150", "3 Series", "C-Class", "A4", "Model 3"];

    const STEP = 5000;
    const MIN = 0;
    const MAX = 500000;

    return (
        <aside className="w-full bg-[#273575] rounded-[5px] p-0 flex flex-col shadow-lg border border-[#3D4C91]">
            {/* Header */}
            <div className="bg-[#4658AC] rounded-t-[5px] px-6 py-4 flex items-center gap-3 border-b border-white/5">
                <div className="w-[3px] h-6 bg-[#F9C146]" />
                <h3 className="text-[18px] font-bold text-white tracking-wide">
                    Filter By
                </h3>
            </div>

            <div className="p-6 flex flex-col gap-5">
                {/* Car Type (Category) Dropdown */}
                <div className="relative">
                    <select 
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full h-[45px] bg-[#313F84] border border-[#4B59A1] rounded-[4px] px-4 appearance-none text-[13px] text-white/70 font-medium focus:outline-none focus:border-[#F9C146] cursor-pointer"
                    >
                        <option value="">Any Car Type</option>
                        {categories.map(cat => <option key={cat} value={cat} className="text-black">{cat}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>

                {/* Other Dropdowns (Compressed for clarity) */}
                {[
                    { label: "Any Color", value: filters.paint, key: "paint", options: colors },
                    { label: "Any Makes", value: filters.make, key: "make", options: makes },
                    { label: "Any Car Model", value: filters.model, key: "model", options: models },
                    { label: "Any Style", value: filters.style, key: "style", options: categories }
                ].map((item) => (
                    <div key={item.key} className="relative">
                        <select 
                            value={item.value}
                            onChange={(e) => setFilters(prev => ({ ...prev, [item.key]: e.target.value }))}
                            className="w-full h-[45px] bg-[#313F84] border border-[#4B59A1] rounded-[4px] px-4 appearance-none text-[13px] text-white/70 font-medium focus:outline-none focus:border-[#F9C146] cursor-pointer"
                        >
                            <option value="">{item.label}</option>
                            {item.options.map(opt => <option key={opt} value={opt} className="text-black">{opt}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>
                ))}

                {/* Professional Price Range Slider */}
                <div className="flex flex-col gap-6 mt-4 px-2">
                    <Range
                        values={rangeValues}
                        step={STEP}
                        min={MIN}
                        max={MAX}
                        onChange={(values) => setRangeValues(values)}
                        renderTrack={({ props, children }) => (
                            <div
                                onMouseDown={props.onMouseDown}
                                onTouchStart={props.onTouchStart}
                                className="h-9 w-full flex items-center"
                                style={props.style}
                            >
                                <div
                                    ref={props.ref}
                                    className="h-2 w-full rounded-full self-center"
                                    style={{
                                        background: getTrackBackground({
                                            values: rangeValues,
                                            colors: ["rgba(255, 255, 255, 0.1)", "#F9C146", "rgba(255, 255, 255, 0.1)"],
                                            min: MIN,
                                            max: MAX
                                        })
                                    }}
                                >
                                    {children}
                                </div>
                            </div>
                        )}
                        renderThumb={({ props, isDragged }) => (
                            <div
                                {...props}
                                key={props.key}
                                className={`h-4 w-4 rounded-full bg-white shadow-md border-2 border-[#F9C146] flex justify-center items-center focus:outline-none ${isDragged ? 'scale-110' : ''} transition-transform`}
                                style={{
                                    ...props.style
                                }}
                            />
                        )}
                    />
                </div>

                <button 
                    onClick={handleFilter}
                    className="w-full h-[45px] bg-[#F9C146] text-[#2E3D83] text-[18px] font-bold rounded-[4px] hover:bg-[#eab02d] transition-all uppercase tracking-wide mt-2 shadow-lg"
                >
                    Filter
                </button>

                <div className="text-center text-[11px] font-bold text-white/60 uppercase tracking-wider">
                    Price: ${rangeValues[0].toLocaleString()} - ${rangeValues[1].toLocaleString()}
                </div>
            </div>
        </aside>
    );
}

export default function AuctionSidebar() {
    return (
        <Suspense fallback={<div className="p-10 text-white">Loading Filters...</div>}>
            <SidebarContent />
        </Suspense>
    );
}
