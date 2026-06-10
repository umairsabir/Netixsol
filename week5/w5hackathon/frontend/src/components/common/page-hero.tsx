"use client";
import { ChevronRight } from "lucide-react";

export default function PageHero({
    title,
    subtitle,
    breadcrumbs,
}: {
    title: string;
    subtitle?: string;
    breadcrumbs?: { label: string; href?: string }[];
}) {
    return (
        <section className="bg-[#C6D8F9] w-full text-center flex flex-col items-center gap-4 pt-14 pb-14 max-sm:pt-10 max-sm:pb-10 px-5 relative">
            <h1 className="font-josefin text-4xl sm:text-5xl font-semibold leading-tight text-[#2E3D83] tracking-normal">
                {title}
            </h1>
            <div className="w-[80px] h-[3px] bg-[#2E3D83] rounded-full" />
            {subtitle && (
                <p className="text-[18px] font-medium text-[#545677] max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
            )}
            {breadcrumbs && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#2E3D83]/10 px-4 py-1.5 rounded-t-[4px] flex items-center justify-center gap-2 whitespace-nowrap z-10">
                    {breadcrumbs.map((crumb, i) => (
                        <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                            {i > 0 && <ChevronRight size={14} className="text-[#545677] shrink-0" />}
                            {crumb.href ? (
                                <a href={crumb.href} className="text-[13px] font-bold text-[#545677] hover:text-[#2E3D83] transition-colors">
                                    {crumb.label}
                                </a>
                            ) : (
                                <span className="text-[13px] font-bold text-[#2E3D83] truncate max-w-[150px] sm:max-w-none">{crumb.label}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}