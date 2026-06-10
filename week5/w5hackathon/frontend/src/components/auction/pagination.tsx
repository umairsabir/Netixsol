"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination() {
    return (
        <div className="flex items-center justify-center gap-2 mt-20 mb-10">
            {/* Previous Arrow */}
            <button className="w-8 h-8 rounded-md bg-[#F7F7FA] flex items-center justify-center text-[#1C1C28] hover:bg-[#2E3D83] hover:text-white transition-all shadow-sm border border-[#EAECF3]">
                <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-md bg-[#2E3D83] text-white text-[12px] font-bold shadow-md">
                    1
                </button>
                <button className="w-8 h-8 rounded-md bg-[#F7F7FA] text-[#1C1C28] text-[12px] font-medium hover:bg-[#EAECF3] transition-all border border-[#EAECF3]">
                    2
                </button>
                <button className="w-8 h-8 rounded-md bg-[#F7F7FA] text-[#1C1C28] text-[12px] font-medium hover:bg-[#EAECF3] transition-all border border-[#EAECF3]">
                    3
                </button>
                <button className="w-8 h-8 rounded-md bg-[#F7F7FA] text-[#1C1C28] text-[12px] font-medium hover:bg-[#EAECF3] transition-all border border-[#EAECF3]">
                    4
                </button>
                <button className="w-8 h-8 rounded-md bg-[#F7F7FA] text-[#1C1C28] text-[12px] font-medium hover:bg-[#EAECF3] transition-all border border-[#EAECF3]">
                    5
                </button>
                <span className="text-[#939393] text-[12px] font-bold px-1">...</span>
                <button className="w-8 h-8 rounded-md bg-[#F7F7FA] text-[#1C1C28] text-[12px] font-medium hover:bg-[#EAECF3] transition-all border border-[#EAECF3]">
                    10
                </button>
            </div>

            {/* Next Arrow */}
            <button className="w-8 h-8 rounded-md bg-[#F7F7FA] flex items-center justify-center text-[#1C1C28] hover:bg-[#2E3D83] hover:text-white transition-all shadow-sm border border-[#EAECF3]">
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
