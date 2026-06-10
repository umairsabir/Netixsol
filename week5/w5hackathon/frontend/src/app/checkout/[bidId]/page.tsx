"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, CheckCircle2, Truck, PackageCheck, CreditCard } from "lucide-react";
import PageHero from "@/components/common/page-hero";
import api from "@/lib/axios";
import { useSocketContext } from "@/context/socket-context";

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const bidId = params.bidId as string;
    const { socket } = useSocketContext();

    const [bid, setBid] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const [shippingStep, setShippingStep] = useState(0); // 0: unpaid, 1: ready, 2: transit, 3: delivered
    const [shippingStatus, setShippingStatus] = useState("");

    useEffect(() => {
        const fetchBid = async () => {
            try {
                const { data } = await api.get(`/bids/${bidId}`);
                setBid(data);
                if (data.isPaid) {
                    setShippingStep(1);
                    setShippingStatus("Paid & Processing");
                }
            } catch (err) {
                console.error("Failed to fetch bid:", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (bidId) fetchBid();
    }, [bidId]);

    useEffect(() => {
        if (socket && bidId) {
            const eventName = `shippingUpdate_${bidId}`;
            socket.on(eventName, (data: any) => {
                setShippingStep(data.step);
                setShippingStatus(data.text);
            });
            return () => { socket.off(eventName); };
        }
    }, [socket, bidId]);

    const handlePayment = async () => {
        setIsPaying(true);
        try {
            await api.post(`/bids/${bidId}/pay`);
            setBid((prev: any) => ({ ...prev, isPaid: true }));
            setShippingStep(1);
            setShippingStatus("Ready for Shipping");
        } catch (err) {
            console.error("Payment failed:", err);
        } finally {
            setIsPaying(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={48} /></div>;
    if (!bid) return <div className="p-20 text-center">Bid record not found.</div>;

    const car = bid.car;

    const steps = [
        { id: 1, label: "Ready for Shipping", icon: <PackageCheck /> },
        { id: 2, label: "In Transit", icon: <Truck /> },
        { id: 3, label: "Delivered", icon: <CheckCircle2 /> }
    ];

    return (
        <main className="min-h-screen bg-white pb-40">
            <PageHero
                title="Checkout & Shipping"
                subtitle="Complete your payment and track your vehicle delivery."
                breadcrumbs={[{ label: "Home", href: "/" }, { label: "Checkout" }]}
            />

            <div className="container mx-auto px-4 lg:px-[118px] py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Car Summary */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-[#F7F7FA] rounded-xl p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-[#2E3D83] mb-6">Winning Vehicle</h2>
                            <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                                <Image src={car.images[0] || "/placeholder-car.webp"} alt={car.title} fill className="object-cover" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2E3D83]">{car.title}</h3>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Winning Bid</span>
                                    <span className="font-bold text-[#2E3D83] text-lg">${bid.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Auction Ended</span>
                                    <span className="text-[#2E3D83]">{new Date(car.auctionEndDate || car.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {!bid.isPaid ? (
                            <div className="bg-[#FFF9E6] rounded-xl p-8 border border-[#F4C23D]/30">
                                <h2 className="text-xl font-bold text-[#2E3D83] mb-4 flex items-center gap-2">
                                    <CreditCard /> Secure Payment
                                </h2>
                                <p className="text-gray-600 mb-8 font-medium">Please finalize your payment to begin the shipping process.</p>
                                <button
                                    onClick={handlePayment}
                                    disabled={isPaying}
                                    className="w-full bg-[#2E3D83] text-white py-4 rounded-lg font-bold text-lg hover:bg-opacity-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {isPaying ? <Loader2 className="animate-spin" /> : "PAY NOW & START SHIPPING"}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-[#E6FFED] rounded-xl p-8 border border-green-200">
                                <h2 className="text-xl font-bold text-green-700 mb-2 flex items-center gap-2">
                                    <CheckCircle2 /> Payment Confirmed
                                </h2>
                                <p className="text-green-600 font-medium tracking-wide">Your vehicle shipping is being processed in real-time.</p>
                            </div>
                        )}
                    </div>

                    {/* Shipping Status */}
                    <div className="flex flex-col gap-10">
                        <div className="bg-[#2E3D83] rounded-xl p-10 text-white shadow-xl h-full flex flex-col justify-between">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">Shipping Tracker</h2>
                                <p className="text-white/60 mb-12">Real-time status updates via Socket.IO</p>

                                <div className="space-y-12 relative">
                                    {/* Vertical Line */}
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

                                    {steps.map((step) => {
                                        const isActive = shippingStep >= step.id;
                                        const isCurrent = shippingStep === step.id;
                                        return (
                                            <div key={step.id} className={`flex items-center gap-8 relative z-10 transition-all duration-500 ${isActive ? "opacity-100" : "opacity-30"}`}>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isActive ? "bg-[#F4C23D] border-[#F4C23D] text-[#2E3D83] scale-110 shadow-[0_0_20px_rgba(244,194,61,0.4)]" : "bg-[#2E3D83] border-white/20 text-white"}`}>
                                                    {step.icon}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-lg font-bold ${isActive ? "text-white" : "text-white/40"}`}>{step.label}</span>
                                                    {isCurrent && <span className="text-[#F4C23D] text-sm animate-pulse font-medium">Currently updating...</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-20 pt-8 border-t border-white/10">
                                <span className="text-white/40 block text-xs uppercase tracking-[3px] mb-2">Current Status</span>
                                <p className="text-2xl font-bold text-[#F4C23D]">
                                    {shippingStatus || (bid.isPaid ? "Processing..." : "Waiting for payment")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
