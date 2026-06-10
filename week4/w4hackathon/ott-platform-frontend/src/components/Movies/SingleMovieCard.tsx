import React from 'react';
import { Play } from 'lucide-react';

interface SingleMovieCardProps {
  title: string;
  image: string;
  duration?: string;
  views?: string;
  isPremium?: boolean;
}

const SingleMovieCard: React.FC<SingleMovieCardProps> = ({ title, image, duration = "1h 30m", views = "2K views", isPremium = true }) => {
  return (
    <div className="bg-surface border border-border-custom rounded-[12px] p-[10px] md:p-[20px] flex flex-col cursor-pointer hover:border-primary transition-colors group min-w-[200px] md:min-w-[250px] lg:min-w-[300px]">
      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] rounded-[10px] overflow-hidden mb-4">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute top-2 right-2">
            {isPremium ? (
              <span className="bg-primary/90 text-text-p text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">PREMIUM</span>
            ) : (
              <span className="bg-green-500/90 text-text-p text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">FREE</span>
            )}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                <Play fill="currentColor" size={24} className="ml-1" />
            </button>
        </div>
      </div>
      
      {/* Info */}
      <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="bg-bg-custom border border-[#262626] rounded-full px-2 py-1 text-[12px] text-text-p flex items-center gap-1">
                <span className="text-text-s">⏳</span> {duration}
            </span>
            <span className="bg-bg-custom border border-[#262626] rounded-full px-2 py-1 text-[12px] text-text-p flex items-center gap-1">
                <span className="text-text-s">👁</span> {views}
            </span>
          </div>
      </div>
    </div>
  );
};

export default SingleMovieCard;
