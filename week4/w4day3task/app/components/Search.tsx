'use client';

import Image from "next/image";

export default function Searchbar() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 py-3 md:py-4 bg-black text-white">
  
  {/* Search Bar */}
  <div className="flex items-center gap-2 px-3 py-2 bg-[#202020] rounded-full w-full md:w-[220px]">
    
    {/* Icon */}
      <Image src={"/searchIcon.png"} alt="search" width={16} height={16} className="md:w-5 md:h-5"/>

    {/* Text */}
    <span className="text-[#A0A0A0] text-xs whitespace-nowrap">
      Search Store
    </span>
  </div>

  {/* Menu - Hidden on mobile */}
  <div className="hidden md:flex items-center gap-4 md:gap-6 md:ml-6">
    <span className="text-xs text-white whitespace-nowrap">Discover</span>
    <span className="text-xs text-[#666666] whitespace-nowrap">Browse</span>
    <span className="text-xs text-[#666666] whitespace-nowrap">News</span>
  </div>

</div>
  )
}