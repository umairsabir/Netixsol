'use client';

import { useEffect } from "react";
import { useGamesStore } from "@/app/store/gamesStore";

export default function FeaturedGames() {
  // Using Zustand store
  const featuredGames = useGamesStore((state) => state.featuredGames);
  const loading = useGamesStore((state) => state.loadingFeaturedGames);
  const fetchFeaturedGamesData = useGamesStore((state) => state.fetchFeaturedGamesData);

  useEffect(() => {
    fetchFeaturedGamesData();
  }, [fetchFeaturedGamesData]);

  if (loading) {
    return <div className="w-full py-4 text-white">Loading featured games...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-8 sm:pt-12 md:pt-16 lg:pt-[88px] pb-8 md:pb-12 lg:pb-[44px]">
      {featuredGames.map((game) => (
        <div key={game.id} className="flex flex-col gap-3 md:gap-4">
          {/* Game Image */}
          <div className="w-full h-[150px] sm:h-[170px] lg:h-[198px] rounded-2xl overflow-hidden">
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Game Name */}
          <span className="text-white font-medium text-base md:text-lg">{game.name}</span>

          {/* Game Description */}
          <p className="text-gray-400 text-xs md:text-sm line-clamp-2">{game.description}</p>

          {/* Game Price */}
          <span className="text-white font-semibold text-base md:text-lg">₹{game.price}</span>
        </div>
      ))}
    </div>
  );
}