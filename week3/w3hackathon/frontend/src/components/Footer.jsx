import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#F8F8F8] dark:bg-[#111111] pt-20 pb-10 font-['Montserrat'] border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* COLLECTIONS */}
                    <div>
                        <h4 className="text-[14px] font-bold tracking-[0.2em] text-black dark:text-white uppercase mb-8">Collections</h4>
                        <ul className="space-y-4 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Black teas</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Green teas</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">White teas</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Herbal teas</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Matcha</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Chai</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Oolong</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Rooibos</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Teaware</li>
                        </ul>
                    </div>

                    {/* LEARN */}
                    <div>
                        <h4 className="text-[14px] font-bold tracking-[0.2em] text-black dark:text-white uppercase mb-8">Learn</h4>
                        <ul className="space-y-4 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">About us</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">About our teas</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Tea academy</li>
                        </ul>
                    </div>

                    {/* CUSTOMER SERVICE */}
                    <div>
                        <h4 className="text-[14px] font-bold tracking-[0.2em] text-black dark:text-white uppercase mb-8">Customer Service</h4>
                        <ul className="space-y-4 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Ordering and payment</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Delivery</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Privacy and policy</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Terms & Conditions</li>
                        </ul>
                    </div>

                    {/* CONTACT US */}
                    <div id="contact-us">
                        <h4 className="text-[14px] font-bold tracking-[0.2em] text-black dark:text-white uppercase mb-8">Contact Us</h4>
                        <ul className="space-y-6 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-black dark:text-white shrink-0 mt-0.5" strokeWidth={1.5} />
                                <span className="leading-relaxed">3 Falahi, Falahi St, Pasdaran Ave, Shiraz, Fars Province Iran</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-black dark:text-white shrink-0" strokeWidth={1.5} />
                                <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">amcopur@gmail.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-black dark:text-white shrink-0" strokeWidth={1.5} />
                                <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">+98 9173038406</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
