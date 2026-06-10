'use client';

import { useEffect } from "react";
import { useGamesStore } from "@/app/store/gamesStore";

export default function HeroSection() {
  // Using Zustand store
  const heroSlider = useGamesStore((state) => state.heroSlider);
  const loading = useGamesStore((state) => state.loadingHeroSlider);
  const fetchHeroSliderData = useGamesStore((state) => state.fetchHeroSliderData);

  useEffect(() => {
    fetchHeroSliderData();
  }, [fetchHeroSliderData]);

  if (loading) {
    return <div className="w-full h-[250px] sm:h-[320px] md:h-[360px] lg:h-[432px] bg-gray-800 rounded-2xl animate-pulse"></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3 md:gap-4 lg:gap-6 w-full overflow-hidden">

      {/* 🔹 LEFT: Hero Section */}
      <div className="
        relative 
        w-full lg:w-[797.6566772460938px] lg:flex-shrink-0
        h-[250px] sm:h-[320px] md:h-[360px] lg:h-[432px] 
        rounded-2xl overflow-hidden
      ">
        
        {/* Background Image */}
        <img
          src="/heroImg.png"
          alt="Hero"
          className="w-full h-full object-cover"
        />

        {/* Overlay Content */}
        <div className="absolute left-4 sm:left-6 lg:left-10 bottom-4 sm:bottom-6 lg:bottom-10 flex flex-col gap-4 lg:gap-6 text-white max-w-[90%] sm:max-w-[400px] lg:max-w-[300px]">
          
          <span className="text-[10px] sm:text-xs">
            PRE-PURCHASE AVAILABLE
          </span>

          <p className="text-sm sm:text-base leading-5 sm:leading-6">
            Kratos now lives as a man in the realm of Norse Gods and monsters.
            It is in this harsh, unforgiving world that he must fight to survive
          </p>

          <button className="bg-white text-black px-3 py-2 sm:px-4 sm:py-3 rounded text-xs sm:text-sm font-medium w-fit">
            PRE-PURCHASE NOW
          </button>

        </div>
      </div>

      {/* 🔹 RIGHT: Sidebar */}
      <div className="
        flex lg:flex-col 
        gap-3 lg:gap-[3px] 
        w-full lg:w-[260px] 
        overflow-x-auto lg:overflow-visible
      ">
        {heroSlider.map((game) => (
          <div
            key={game.id}
            className="
              flex items-center gap-4 p-3 
              min-w-[220px] lg:min-w-0
              rounded-xl transition-colors 
              hover:bg-[#252525] cursor-pointer
            "
          >
            <img
              src={game.image}
              className="w-[50px] h-[70px] sm:w-[60px] sm:h-[80px] rounded-md object-cover"
            />
            <span className="text-white text-xs sm:text-sm">
              {game.description}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}