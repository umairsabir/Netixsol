'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Image from "next/image";
import { useRef, useEffect } from "react";
import { useGamesStore } from "@/app/store/gamesStore";

interface GamesOnSaleProps {
  title: string;
}

export default function GamesOnSale({ title }: GamesOnSaleProps) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  
  // Using Zustand store
  const gamesOnSale = useGamesStore((state) => state.gamesOnSale);
  const loadingGamesOnSale = useGamesStore((state) => state.loadingGamesOnSale);
  const fetchGamesOnSaleData = useGamesStore((state) => state.fetchGamesOnSaleData);

  useEffect(() => {
    fetchGamesOnSaleData();
  }, [fetchGamesOnSaleData]);

  if (loadingGamesOnSale) {
    return <div className="w-full py-4 text-white">Loading games...</div>;
  }

  if (gamesOnSale.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1">
        <p className="text-white font-medium text-[18px] ">{title}</p>
        <Image src={"/gameOnSale.png"} alt="game" width={9} height={9}/>
        </div>
        <div className="flex gap-1">
          <button ref={prevRef}><Image src="/right-btn.png" width={30} height={30} alt="prev" className="rotate-180 cursor-pointer" /></button>
          <button ref={nextRef}><Image src="/right-btn.png" width={30} height={30} alt="next" className="cursor-pointer" /></button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        loop={gamesOnSale.length >= 6}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        slidesPerView={1}
        spaceBetween={16}
        breakpoints={{
          337: {slidesPerView: 1.5},
          640: { slidesPerView: 4 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        onBeforeInit={(swiper) => {
          if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
      >
        {gamesOnSale.map((game) => (
          <SwiperSlide key={game.id} className="flex justify-center">
            <div className="flex flex-col w-[213px] gap-2">
              <div className="w-[190px] h-[284px] rounded-md overflow-hidden">
                <Image src={game.image} alt={game.name} width={200} height={284} className="object-cover"/>
              </div>
              <span className="text-white font-medium text-sm">{game.name}</span>
              <div className="flex gap-2 items-center">
                <div className="bg-[#0074E4] text-white px-2 py-1 rounded">{game.discount}</div>
                <span className="line-through text-gray-400">₹{game.originalPrice}</span>
                <span className="text-white font-medium">₹{game.discountedPrice}</span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}