'use client';

import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative w-full h-[42px] bg-[#313131] flex items-center px-4">
      
      {/* Logo */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <Image src="/logo.png" alt="Epic Games" width={24} height={28.8} />
      </div>

      {/* Desktop Navigation (ONLY lg) */}
      <div className="hidden lg:flex absolute left-[65px] top-1/2 -translate-y-1/2 items-center gap-6">
        <div className="relative">
          <a className="text-xs font-medium text-[#aaaaaa] hover:text-white">
            STORE
          </a>
          <div className="absolute bottom-[-10px] left-0 w-[38px] h-1 bg-[#007AFF]"></div>
        </div>

        <a className="text-xs text-[#aaaaaa] hover:text-white">FAQ</a>
        <a className="text-xs text-[#aaaaaa] hover:text-white">HELP</a>
        <a className="text-xs text-[#aaaaaa] hover:text-white">UNREAL ENGINE</a>
      </div>

      {/* Right Section (ONLY lg) */}
      <div className="hidden lg:flex absolute right-0 top-0 h-full items-center gap-6">
        <button>
          <Image src="/globe.png" alt="globe" width={24} height={24} />
        </button>

        <button className="flex items-center gap-2 text-xs text-[#aaaaaa] hover:text-white">
          <Image src="/signin.png" alt="signin" width={24} height={24} />
          SIGN IN
        </button>

        <button className="w-28 h-[42px] bg-[#007AFF] hover:bg-blue-600 text-white text-xs">
          DOWNLOAD
        </button>
      </div>

      {/* Mobile / Tablet Right Section */}
      <div className="lg:hidden ml-auto flex items-center gap-4">
        <button>
          <Image src="/globe.png" alt="globe" width={20} height={20} />
        </button>

        {/* Hamburger */}
        <button onClick={() => setOpen(!open)} className="text-white text-xl">
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-[42px] left-0 w-full bg-[#313131] flex flex-col gap-4 p-4 lg:hidden z-50">
          <a className="text-sm text-[#aaaaaa] hover:text-white">STORE</a>
          <a className="text-sm text-[#aaaaaa] hover:text-white">FAQ</a>
          <a className="text-sm text-[#aaaaaa] hover:text-white">HELP</a>
          <a className="text-sm text-[#aaaaaa] hover:text-white">UNREAL ENGINE</a>

          <hr className="border-gray-600" />

          <button className="flex items-center gap-2 text-sm text-[#aaaaaa]">
            <Image src="/signin.png" alt="signin" width={20} height={20} />
            SIGN IN
          </button>

          <button className="bg-[#007AFF] py-2 text-sm text-white">
            DOWNLOAD
          </button>
        </div>
      )}
    </nav>
  );
}