'use client';

import { useEffect } from "react";
import Image from "next/image";
import { useGamesStore } from "@/app/store/gamesStore";

export default function FreeGames() {
  // Using Zustand store
  const freeGames = useGamesStore((state) => state.freeGames);
  const loading = useGamesStore((state) => state.loadingFreeGames);
  const fetchFreeGamesData = useGamesStore((state) => state.fetchFreeGamesData);

  useEffect(() => {
    fetchFreeGamesData();
  }, [fetchFreeGamesData]);

  if (loading) {
    return <div className="w-full py-4 text-white">Loading free games...</div>;
  }

  return (
    <div className="bg-[#2A2A2A] rounded-md p-4 md:p-6 mb-12 md:mb-[77px] w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-[10px]">
        <Image src="/free.png" alt="free" width={46} height={46}/>
        <h2 className="text-white font-medium text-lg">Free Games</h2>
        </div>
        <button className="text-white border border-white px-4 py-1 rounded text-sm hover:bg-white hover:text-black transition w-fit">View More</button>
      </div>

      {/* Games List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 lg:gap-13">
        {freeGames.map((game) => (
          <div key={game.id} className="flex flex-col gap-2">
            {/* Game Image */}
            <div className="w-full h-[120px] sm:h-[180px] md:h-[250px] lg:h-[315px] rounded-md overflow-hidden">
              <img
                src={game.image}
                alt={game.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Game Name */}
            <span className="text-white text-xs md:text-sm font-medium line-clamp-1">{game.name}</span>

            {/* Status & Date */}
            <span className="text-gray-400 text-xs line-clamp-1">
              {game.status} - {game.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}