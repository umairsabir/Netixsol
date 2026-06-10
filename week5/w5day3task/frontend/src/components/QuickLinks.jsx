import React from 'react';

const QuickLinks = () => {
    return (
        <div className="bg-[#F8F8F8] py-20 border-t border-gray-100">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    {/* Collections */}
                    <div>
                        <h4 className="text-[12px] font-bold tracking-[0.2em] mb-10 text-[#1A1A1A] uppercase">Collections</h4>
                        <ul className="space-y-4 text-[11px] text-gray-500 font-medium uppercase tracking-widest">
                            <li className="hover:text-black cursor-pointer transition-colors">Black teas</li>
                            <li className="hover:text-black cursor-pointer transition-colors">Green teas</li>
                            <li className="hover:text-black cursor-pointer transition-colors">White teas</li>
                            <li className="hover:text-black cursor-pointer transition-colors">Herbal teas</li>
                            <li className="hover:text-black cursor-pointer transition-colors">Matcha</li>
                            <li className="hover:text-black cursor-pointer transition-colors">Chai</li>
                            <li className="hover:text-black cursor-pointer transition-colors">Oolong</li>
                            <li className="hover:text-black cursor-pointer transition-colors">Rooibos</li>
                            <li className="hover:text-black cursor-pointer transition-colors">Teaware</li>
                        </ul>
                    </div>

                    {/* Learn */}
                    <div>
                        <h4 className="text-[12px] font-bold tracking-[0.2em] mb-10 text-[#1A1A1A] uppercase">Learn</h4>
                        <ul className="space-y-4 text-[11px] text-gray-500 font-medium uppercase tracking-widest">
                            <li className="hover:text-black cursor-pointer transition-colors">About us</li>
                            <li className="hover:text-black cursor-pointer transition-colors">About our teas</li>
                            <li className="hover:text-black cursor-pointer transition-colors">Tea academy</li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-[12px] font-bold tracking-[0.2em] mb-10 text-[#1A1A1A] uppercase">Customer Service</h4>
                        <ul className="space-y-4 text-[11px] text-gray-500 font-medium uppercase tracking-widest">
                            <li className="hover:text-black cursor-pointer transition-colors">Ordering and payment</li>
                            <li className="hover:text-black cursor-pointer transition-colors">Delivery</li>
                            <li className="hover:text-black cursor-pointer transition-colors">Privacy and policy</li>
                            <li className="hover:text-black cursor-pointer transition-colors">Terms & Conditions</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickLinks;
