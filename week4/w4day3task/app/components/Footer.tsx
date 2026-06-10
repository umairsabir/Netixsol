'use client';

import Image from "next/image";
import { useEffect } from "react";
import { useGamesStore } from "@/app/store/gamesStore";
import ScrollTopButton from "./ScrollTopButton";

export default function Footer() {
  // Using Zustand store
  const resourceLinks = useGamesStore((state) => state.resourceLinks);
  const loading = useGamesStore((state) => state.loadingResourceLinks);
  const fetchResourceLinksData = useGamesStore((state) => state.fetchResourceLinksData);

  useEffect(() => {
    fetchResourceLinksData();
  }, [fetchResourceLinksData]);

  if (loading) {
    return <div className="w-full py-4 text-white">Loading footer...</div>;
  }

  return (
    <footer className="bg-[#202020] py-8 md:py-12 px-4 md:px-8 relative">
      <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-0">
        {/* Social Icons */}
        <div className="flex gap-4 mb-12">
          <a href="#" className="text-white hover:text-gray-400 transition">
            <Image src="/facebook.png" alt="facebook" height={24} width={24} />
          </a>
          <a href="#" className="text-white hover:text-gray-400 transition">
            <Image src="/twitter.png" alt="twitter" height={24} width={24} />
          </a>
          <a href="#" className="text-white hover:text-gray-400 transition">
            <Image src="/youtube.png" alt="youtube" height={24} width={24} />
          </a>
        </div>
        <ScrollTopButton />
      </div>

      {/* Resources Section */}
      <div className="mb-12 pb-8 border-b border-[rgba(255,255,255,0.1)]">
        <h3 className="text-white text-sm font-poppins mb-6">Resource</h3>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
          {resourceLinks.map((column, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              {column.links.map((link, linkIdx) => (
                <a
                  key={linkIdx}
                  href="#"
                  className="text-[#E7E7E7] text-sm font-poppins hover:text-white transition"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Copyright Section */}
      <div className="mb-12">
        <p className="text-[rgba(255,255,255,0.6)] text-sm font-poppins leading-6 max-w-[888px]">
          © 2022, Epic Games, Inc. All rights reserved. Epic, Epic Games, Epic
          Games logo, Fortnite, Fortnite logo, Unreal, Unreal Engine, Unreal
          Engine logo, Unreal Tournament ) and the Unreal Tournament logo are
          trademarks or registered trademarks of Epic Games, Inc. in the United
          States of America and elsewhere. Other brand or product names are
          trademarks of their respective owners. Transactions outside the United
          States are handled through Epic Games International, S.à r.l.
        </p>
      </div>

      {/* Bottom Links */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex flex-col md:flex-row gap-3 md:gap-8">
          <a
            href="#"
            className="text-[#E7E7E7] text-xs font-poppins hover:text-white transition"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-[#E7E7E7] text-xs font-poppins hover:text-white transition"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-[#E7E7E7] text-xs font-poppins hover:text-white transition"
          >
            Store Refund Policy
          </a>
        </div>

        {/* Scroll to Top Button */}
        <Image src={"/logo.png"} alt="logo" width={24} height={26.4} className="mt-4 md:mt-0"/>
      </div>
    </footer>
  );
}
