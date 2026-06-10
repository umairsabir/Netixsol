"use client";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

const homeLinks = ["Help Center", "FAQ", "My Account", "My Account"];
const auctionLinks = ["Help Center", "FAQ", "My Account", "My Account"];

export default function Footer() {
    return (
        <footer className="bg-[#2e3d83] w-full pt-[45px] lg:h-[471px] h-auto flex flex-col justify-between">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[118px] flex flex-col lg:flex-row gap-8">

                {/* LEFT SIDE — 40% */}
                <div className="w-full lg:w-[40%]">
                    <a href="/" className="flex items-center gap-2 mb-3 shrink-0">
                        <Image src="/logo.png" alt="Logo" width={165} height={55} style={{ height: "auto" }} />
                    </a>
                    <p className="text-[16px] font-normal text-[#b9b9b9] leading-[24px] mb-4 font-lato">
                        Lorem ipsum dolor sit amet consectetur. Mauris eu convallis proin turpis pretium donec
                        orci semper. Sit suscipit lacus cras commodo in lectus sed egestas. Mattis egestas sit
                        viverra pretium tincidunt libero. Suspendisse aliquam donec leo nisl purus et quam pulvinar.
                        Odio egestas egestas tristique et lectus viverra in sed mauris.
                    </p>
                    <p className="text-[20px] font-bold text-white tracking-[0.015em] leading-[133%] mb-1">
                        Follow Us
                    </p>
                    <div className="w-[52px] h-[3px] bg-white mb-3" />
                    <div className="flex gap-[20px]">
                        <a href="#" className="w-9 h-9 rounded-full bg-[#023D95] flex items-center justify-center text-white hover:bg-[#f9c146] hover:text-[#2e3d83] transition-all duration-300" aria-label="Facebook">
                            <svg width="12" height="22" viewBox="0 0 12 22" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M3.36213 21.8713V13.4799C3.36213 12.5515 2.60949 11.7988 1.68107 11.7988C0.752639 11.7988 0 11.0462 0 10.1178V9.85776C0 8.92933 0.752639 8.17669 1.68107 8.17669C2.60949 8.17669 3.36213 7.42406 3.36213 6.49563V5.52072C3.36213 5.52072 3.12027 0 8.02915 0H10.1548C11.1739 0 12 0.826129 12 1.84521C12 2.86429 11.1739 3.69042 10.1548 3.69042H9.52572C9.52572 3.69042 7.70477 3.59425 7.68495 5.42338V6.33375C7.68495 7.35158 8.52743 8.17669 9.54526 8.17669C10.6592 8.17669 11.5291 9.17276 11.3538 10.2728C11.2136 11.1519 10.4554 11.7988 9.56526 11.7988H9.51513C8.48246 11.7988 7.64532 12.636 7.64532 13.6686V19.8584C7.64532 21.0412 6.68649 22 5.50372 22H3.49086C3.41976 22 3.36213 21.9424 3.36213 21.8713Z" />
                            </svg>
                        </a>
                        <a href="#" className="w-9 h-9 rounded-full bg-[#023D95] flex items-center justify-center text-white hover:bg-[#f9c146] hover:text-[#2e3d83] transition-all duration-300" aria-label="Instagram">
                            <svg width="20" height="20" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16.5 6H9.5C7.567 6 6 7.567 6 9.5V16.5C6 18.433 7.567 20 9.5 20H16.5C18.433 20 20 18.433 20 16.5V9.5C20 7.567 18.433 6 16.5 6Z" />
                                <path d="M15.9675 12.56C16.0601 13.1841 15.9535 13.8216 15.6629 14.3817C15.3722 14.9418 14.9124 15.396 14.3488 15.6797C13.7851 15.9634 13.1464 16.0621 12.5234 15.9619C11.9004 15.8616 11.3249 15.5675 10.8787 15.1213C10.4325 14.6751 10.1384 14.0996 10.0381 13.4766C9.93786 12.8536 10.0366 12.2149 10.3203 11.6512C10.604 11.0876 11.0582 10.6278 11.6183 10.3371C12.1784 10.0465 12.8159 9.93989 13.4401 10.0325C14.0767 10.1269 14.6662 10.4235 15.1213 10.8787C15.5765 11.3338 15.8731 11.9233 15.9675 12.56Z" />
                                <path d="M19.7578 7.96729H19.768" />
                            </svg>
                        </a>
                        <a href="#" className="w-9 h-9 rounded-full bg-[#023D95] flex items-center justify-center text-white hover:bg-[#f9c146] hover:text-[#2e3d83] transition-all duration-300" aria-label="LinkedIn">
                            <svg width="18" height="18" viewBox="0 0 26 26" fill="currentColor">
                                <path d="M15.8003 10.4209C16.9142 10.4209 17.9826 10.8867 18.7703 11.7158C19.5579 12.5449 20.0005 13.6694 20.0005 14.8419V19.9998H17.2003V14.8419C17.2003 14.4511 17.0528 14.0762 16.7903 13.7999C16.5277 13.5235 16.1716 13.3682 15.8003 13.3682C15.429 13.3682 15.0728 13.5235 14.8103 13.7999C14.5477 14.0762 14.4002 14.4511 14.4002 14.8419V19.9998H11.6001V14.8419C11.6001 13.6694 12.0426 12.5449 12.8303 11.7158C13.618 10.8867 14.6863 10.4209 15.8003 10.4209Z" />
                                <path d="M8.80012 11.158H6V20H8.80012V11.158Z" />
                                <path d="M7.40006 8.94735C8.17329 8.94735 8.80012 8.28756 8.80012 7.47367C8.80012 6.65979 8.17329 6 7.40006 6C6.62683 6 6 6.65979 6 7.47367C6 8.28756 6.62683 8.94735 7.40006 8.94735Z" />
                            </svg>
                        </a>
                        <a href="#" className="w-9 h-9 rounded-full bg-[#023D95] flex items-center justify-center text-white hover:bg-[#f9c146] hover:text-[#2e3d83] transition-all duration-300" aria-label="Twitter">
                            <svg width="18" height="15" viewBox="0 0 22 19" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M0.00188243 3.30687C0.0367182 2.08948 1.60617 1.8543 2.54352 2.63188C3.24923 3.21729 4.14054 3.8611 5.19081 4.42843C7.55328 5.70457 10.2514 2.61962 12.3798 0.982616C12.5794 0.829112 12.7982 0.678797 13.0381 0.532877C13.0381 0.532877 15.6607 -1.00844 18.3551 1.15162C18.6999 1.42805 19.1264 1.60185 19.5527 1.48547C19.8773 1.39688 20.2996 1.24763 20.7785 0.996815C21.2427 0.753666 21.6844 1.00478 21.4284 1.4621C21.3231 1.65023 21.182 1.86109 20.9933 2.09271C20.6977 2.45551 20.4244 3.08316 20.8684 2.93535C21.2655 2.80316 22.1074 2.86591 21.8643 3.20656C21.6159 3.55474 21.2404 3.95438 20.6757 4.33408C20.28 4.60023 20.0125 5.03612 19.9955 5.51275C19.9017 8.14348 18.859 16.6138 9.43083 18.7296C9.43083 18.7296 6.3162 19.4328 3.01313 18.5711C1.86106 18.2706 1.2277 16.8468 2.39709 16.6229C3.47515 16.4165 4.02992 14.441 3.19928 13.7235C2.80088 13.3793 2.41256 12.9252 2.07262 12.3263C1.89508 12.0136 1.87943 11.6147 2.23844 11.6362C2.66945 11.662 2.92007 11.1994 2.53382 11.0064C1.69689 10.5883 0.658707 9.65979 0.151802 7.59801C0.061698 7.23153 0.152175 6.8059 0.50394 6.94263C0.909536 7.10027 1.40514 6.71542 1.12147 6.38542C0.558107 5.73005 -0.0380208 4.70135 0.00188243 3.30687Z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* RIGHT SIDE — 60% */}
                <div className="w-full lg:w-[60%] grid grid-cols-1 sm:grid-cols-3 gap-8">

                    {/* Home */}
                    <div>
                        <h4 className="text-[14px] font-bold text-[#e9e9e9] mb-5">Home</h4>
                        <ul className="flex flex-col gap-5 list-none p-0 m-0">
                            {homeLinks.map((l, i) => (
                                <li key={i}>
                                    <a href="#" className="text-[14px] font-normal text-white hover:text-[#f9c146] transition-colors">
                                        {l}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Car Auction */}
                    <div>
                        <h4 className="text-[14px] font-bold text-[#e9e9e9] mb-5">Car Auction</h4>
                        <ul className="flex flex-col gap-5 list-none p-0 m-0">
                            {auctionLinks.map((l, i) => (
                                <li key={i}>
                                    <a href="#" className="text-[14px] font-normal text-white hover:text-[#f9c146] transition-colors">
                                        {l}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About Us */}
                    <div>
                        <h4 className="text-[14px] font-bold text-[#e9e9e9] mb-5">About us</h4>
                        <div className="relative pl-8 flex flex-col gap-8">
                            {/* Phone */}
                            <div className="relative flex gap-3.5 items-start">
                                <div className="absolute -left-[28px] top-[7px] w-[10px] h-[10px] rounded-full bg-white z-10" />
                                <div className="absolute -left-[24px] top-[12px] w-[2px] h-[calc(100%+32px)] bg-white/40" />
                                <Phone size={16} className="text-white shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[14px] font-normal text-white/80 leading-[17px] font-lato">Hot Line Number</p>
                                    <p className="text-[14px] font-semibold text-white leading-[20px] mt-0.5">+054 211 4444</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="relative flex gap-3.5 items-start">
                                <div className="absolute -left-[28px] top-[7px] w-[10px] h-[10px] rounded-full bg-white z-10" />
                                <div className="absolute -left-[24px] top-[12px] w-[2px] h-[calc(100%+32px)] bg-white/40" />
                                <Mail size={16} className="text-white shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[14px] font-normal text-white/80 leading-[17px] font-lato">Email Id :</p>
                                    <a href="mailto:info@cardeposit.com" className="text-[14px] font-semibold text-white underline leading-[20px] mt-0.5 block hover:text-[#f9c146] transition-colors font-lato">
                                        info@cardeposit.com
                                    </a>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="relative flex gap-3.5 items-start">
                                <div className="absolute -left-[28px] top-[7px] w-[10px] h-[10px] rounded-full bg-white" />
                                <MapPin size={16} className="text-white shrink-0 mt-0.5" />
                                <p className="text-[14px] font-normal text-white leading-[18px] font-lato">
                                    Office No 6, SKB Plaza next to Bentley showroom, Umm Al Sheif Street, Sheikh Zayed Road, Dubai, UAE
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 lg:px-[118px]">
                <div className="border-t border-[#656565]" />
                <div className="py-6 text-center">
                    <p className="text-[14px] font-medium text-white underline tracking-[0.015em] cursor-pointer hover:text-[#f9c146] transition-colors font-lato">
                        Copyright 2022 All Rights Reserved
                    </p>
                </div>
            </div>
        </footer>
    );
}