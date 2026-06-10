"use client";
import PageHero from "@/components/common/page-hero";
import { Shield, Zap, Heart, Award, Users, Car } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
    const values = [
        {
            icon: Shield,
            title: "Trust & Transparency",
            description: "We provide detailed vehicle reports and verified seller information to ensure every bid is made with confidence."
        },
        {
            icon: Zap,
            title: "Fast & Efficient",
            description: "Our real-time bidding system ensures a seamless experience, from listing a car to the final hammer fall."
        },
        {
            icon: Heart,
            title: "Customer Centric",
            description: "We are committed to providing exceptional support and a user-friendly platform for both buyers and sellers."
        }
    ];

    const stats = [
        { icon: Car, count: "15,000+", label: "Vehicles Sold" },
        { icon: Users, count: "85,000+", label: "Happy Members" },
        { icon: Award, count: "12+", label: "Years Experience" }
    ];

    return (
        <main className="min-h-screen bg-white">
            <PageHero
                title="About Us"
                subtitle="Redefining the car auction experience with trust and technology."
                breadcrumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
            />

            {/* Our Story Section */}
            <section className="max-w-[1440px] mx-auto px-[118px] py-24 max-lg:px-8 max-sm:px-5 flex items-center gap-16 max-md:flex-col">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-[3px] h-6 bg-[#F9C146]" />
                        <h2 className="text-[32px] font-bold text-[#2E3D83] uppercase tracking-wide">Our Journey</h2>
                    </div>
                    <p className="text-[18px] text-[#545677] leading-relaxed">
                        Founded in 2012, Car Auction began with a simple mission: to make the process of buying and selling premium vehicles transparent, accessible, and exciting.
                    </p>
                    <p className="text-[16px] text-[#545677] leading-relaxed">
                        Today, we are proud to be a leading digital marketplace, connecting thousands of automotive enthusiasts every day. Our platform combines cutting-edge real-time technology with a deep passion for cars, ensuring that every auction is fair, professional, and high-stakes.
                    </p>
                    <div className="grid grid-cols-3 gap-8 pt-6 max-sm:grid-cols-1">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl bg-[#F1F2FF]">
                                <stat.icon className="text-[#2E3D83] mb-2" size={32} />
                                <span className="text-[24px] font-bold text-[#2E3D83]">{stat.count}</span>
                                <span className="text-[12px] font-bold text-[#F9C146] uppercase">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 relative h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                        src="/car.jpg"
                        alt="Our Story"
                        fill
                        style={{ objectFit: "cover", objectPosition: "left" }}
                    />
                </div>
            </section>

            {/* Core Values Section */}
            <section className="bg-[#2E3D83] py-24">
                <div className="max-w-[1440px] mx-auto px-[118px] max-lg:px-8 max-sm:px-5">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-[40px] font-bold text-white">Our Core Values</h2>
                        <p className="text-white/60 max-w-2xl mx-auto italic">
                            "The driving force behind everything we do at Car Auction."
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-10 max-md:grid-cols-1">
                        {values.map((value, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-2xl hover:bg-white/10 transition-all group">
                                <div className="w-16 h-16 bg-[#F9C146] rounded-2xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform">
                                    <value.icon className="text-[#2E3D83]" size={32} />
                                </div>
                                <h3 className="text-[24px] font-bold text-white mb-4">{value.title}</h3>
                                <p className="text-white/70 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 text-center space-y-8">
                <h2 className="text-[40px] max-sm:text-[30px] font-bold text-[#2E3D83]">Ready to find your dream car?</h2>
                <div className="flex items-center justify-center gap-6 max-sm:flex-col">
                    <a href="/auction" className="bg-[#F9C146] text-[#2E3D83] px-10 py-4 rounded-full font-bold text-[18px] hover:bg-white hover:border-[#F9C146] border-2 border-transparent transition-all">
                        Browse Auctions
                    </a>
                    <a href="/car/sell" className="border-2 border-[#2E3D83] text-[#2E3D83] px-10 py-4 rounded-full font-bold text-[18px] hover:bg-[#2E3D83] hover:text-white transition-all">
                        Sell Your Car
                    </a>
                </div>
            </section>
        </main>
    );
}
