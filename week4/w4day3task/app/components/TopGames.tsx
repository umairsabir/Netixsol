'use client';

import { useEffect } from "react";
import { useGamesStore, Game } from "@/app/store/gamesStore";

interface GameColumnProps {
  title: string;
  games: Game[];
}

function GameCard({ game }: { game: Game }) {
  return (
    <div className="flex gap-3 mb-[10px]">
      {/* Game Image */}
      <div className="w-[60px] h-[80px] flex-shrink-0 rounded-[4px] overflow-hidden">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Game Info */}
      <div className="flex flex-col justify-start flex-grow">
        {/* Game Name */}
        <span className="text-[#F5F5F5] text-sm   leading-[21px]">
          {game.name}
        </span>

        {/* Game Price */}
        <span className="text-white text-xs leading-[18px] mt-1">
          {typeof game.price === 'number' ? `₹${game.price}` : game.price}
        </span>
      </div>
    </div>
  );
}

function GameColumn({ title, games }: GameColumnProps) {
  return (
    <div className="flex-1">
      {/* Column Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-8 md:mb-[55px]">
        <h3 className="text-white text-lg md:text-[22px] leading-[28px] md:leading-[33px]">
          {title}
        </h3>
        <button className="border border-[#F5F5F5] rounded-[5px] px-3 py-2 text-[#F5F5F5] text-xs md:text-base  hover:bg-[#F5F5F5] hover:text-black transition w-fit">
          View More
        </button>
      </div>

      {/* Games List */}
      <div className="space-y-[10px]">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}

export default function TopGames() {
  // Using Zustand store
  const topSellers = useGamesStore((state) => state.topSellers);
  const bestSellers = useGamesStore((state) => state.bestSellers);
  const upcomingGames = useGamesStore((state) => state.upcomingGames);
  const loading = useGamesStore(
    (state) =>
      state.loadingTopSellers || state.loadingBestSellers || state.loadingUpcomingGames
  );

  const fetchTopSellersData = useGamesStore((state) => state.fetchTopSellersData);
  const fetchBestSellersData = useGamesStore((state) => state.fetchBestSellersData);
  const fetchUpcomingGamesData = useGamesStore((state) => state.fetchUpcomingGamesData);

  useEffect(() => {
    fetchTopSellersData();
    fetchBestSellersData();
    fetchUpcomingGamesData();
  }, [fetchTopSellersData, fetchBestSellersData, fetchUpcomingGamesData]);

  if (loading) {
    return <div className="bg-black px-4 md:px-0 text-white py-8">Loading games...</div>;
  }

  return (
    <div className="bg-black px-4 md:px-0">
      <div>
        {/* Main Grid with 3 Columns - Responsive */}
        <div className="flex flex-col lg:flex-row lg:gap-3">
          {/* Top Sellers */}
          <GameColumn title="Top Sellers" games={topSellers} />

          {/* Divider - Hidden on mobile */}
          <div className="hidden lg:flex justify-center">
            <div className="w-[2px] bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.1)] to-transparent"></div>
          </div>

          {/* Best Sellers */}
          <GameColumn title="Best Seller" games={bestSellers} />

          {/* Divider - Hidden on mobile */}
          <div className="hidden lg:flex justify-center">
            <div className="w-[2px] bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.1)] to-transparent"></div>
          </div>

          {/* Top Upcoming */}
          <GameColumn title="Top Upcoming game" games={upcomingGames} />
        </div>
      </div>
    </div>
  );
}
