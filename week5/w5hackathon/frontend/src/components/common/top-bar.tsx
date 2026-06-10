"use client";
import { Mail } from "lucide-react";

export default function TopBar() {
    return (
        <div className="bg-[#2e3d83] w-full">
            <div className="max-w-[1440px] mx-auto px-[118px] max-lg:px-8 max-sm:px-5 h-[50px] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                    <span className="text-white text-base font-medium capitalize">Call us</span>
                    <span className="text-white text-base font-medium">570-694-4002</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Mail size={16} className="text-white" />
                    <span className="text-white text-base font-medium">
                        Email Id :{" "}
                        <a href="mailto:info@cardeposit.com" className="text-white underline">
                            info@cardeposit.com
                        </a>
                    </span>
                </div>
            </div>
        </div>
    );
}