import React from 'react';
import { Package, ShieldCheck, Truck, Gift } from 'lucide-react';

const FeaturesBar = () => {
    const features = [
        { icon: <Package size={20} />, text: "450+ KIND OF LOOSE TEA" },
        { icon: <ShieldCheck size={20} />, text: "CERTIFICATED ORGANIC TEAS" },
        { icon: <Truck size={20} />, text: "FREE DELIVERY" },
        { icon: <Gift size={20} />, text: "SAMPLE FOR ALL TEAS" },
    ];

    return (
        <div className="bg-[#F8F8F8] dark:bg-[#111111] py-16 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center mb-12">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-center gap-3 text-[#1A1A1A] dark:text-white">
                            {feature.icon}
                            <span className="text-[11px] font-bold tracking-[0.15em] text-center md:text-left">
                                {feature.text}
                            </span>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-center">
                    <button className="border border-black dark:border-white text-black dark:text-white text-[10px] font-bold tracking-[0.2em] py-3 px-12 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all uppercase">
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeaturesBar;
