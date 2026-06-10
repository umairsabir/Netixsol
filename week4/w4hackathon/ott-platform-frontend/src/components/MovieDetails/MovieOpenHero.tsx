import React from 'react';
import { Play, Plus, ThumbsUp, Volume2 } from 'lucide-react';

interface MovieOpenHeroProps {
  movie: {
    title: string;
    description: string;
    image: string;
  };
  onPlay?: () => void;
}

const MovieOpenHero: React.FC<MovieOpenHeroProps> = ({ movie, onPlay }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-[12px] h-[400px] md:h-[600px] desktop:h-[835px]">
      {/* Background Image */}
      <img
        src={movie.image}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-custom from-0% via-bg-custom/40 to-transparent to-100%" />

      {/* Main Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end items-center pb-[20px] px-[24px] gap-[20px] xl:pb-[30px] xl:px-[40px] xl:gap-[30px] desktop:pb-[40px] desktop:px-[50px] desktop:gap-[50px]">
        {/* Text Container */}
        <div className="flex flex-col items-center w-full px-0 gap-[14px] xl:px-[100px] desktop:px-[150px] max-w-[1494px]">
          <h1 className="font-bold text-center text-text-p text-[28px] xl:text-[42px] desktop:text-[52px] leading-tight">
            {movie.title}
          </h1>
          <p className="font-medium text-center text-text-s leading-[150%] max-w-[1194px] text-[14px] xl:text-[16px] desktop:text-[18px] opacity-80 line-clamp-3 md:line-clamp-none">
            {movie.description}
          </p>
        </div>

        {/* Center Buttons Container */}
        <div className="flex flex-row items-center justify-center gap-[10px] md:gap-[16px] desktop:gap-[20px] w-full max-w-[1494px]">
          {/* Play Button */}
          <button 
            onClick={onPlay}
            className="flex items-center justify-center font-semibold text-text-p rounded-[8px] bg-primary hover:bg-red-700 transition-all hover:scale-105 h-[48px] px-[20px] gap-[8px] text-[16px] xl:h-[56px] xl:px-[28px] desktop:h-[64px] desktop:px-[32px] desktop:text-[20px]"
          >
            <Play fill="currentColor" size={24} />
            Play Now
          </button>

          {/* Icons Container */}
          <div className="flex flex-row items-center gap-[8px] desktop:gap-[10px]">
            <button className="flex items-center justify-center bg-bg-custom/60 backdrop-blur-md border border-border-darker rounded-[8px] text-text-p hover:bg-surface transition-all hover:scale-105 w-[48px] h-[48px] xl:w-[56px] xl:h-[56px] desktop:w-[64px] desktop:h-[64px]">
              <Plus size={24} />
            </button>
            <button className="flex items-center justify-center bg-bg-custom/60 backdrop-blur-md border border-border-darker rounded-[8px] text-text-p hover:bg-surface transition-all hover:scale-105 w-[48px] h-[48px] xl:w-[56px] xl:h-[56px] desktop:w-[64px] desktop:h-[64px]">
              <ThumbsUp size={24} />
            </button>
            <button className="flex items-center justify-center bg-bg-custom/60 backdrop-blur-md border border-border-darker rounded-[8px] text-text-p hover:bg-surface transition-all hover:scale-105 w-[48px] h-[48px] xl:w-[56px] xl:h-[56px] desktop:w-[64px] desktop:h-[64px]">
              <Volume2 size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieOpenHero;
