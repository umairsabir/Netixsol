import React from "react";
import { Clock, Star } from "lucide-react";

interface MustWatchCardProps {
  title: string;
  image: string;
  duration: string;
  views: string;
}

const MustWatchCard: React.FC<MustWatchCardProps> = ({
  title,
  image,
  duration,
  views,
}) => {
  return (
    <div className="bg-surface border border-border-darker rounded-[12px] p-[20px] flex flex-col gap-[20px] w-[359.5px] h-[500px] flex-shrink-0 cursor-pointer hover:border-primary transition-colors group">
      {/* Movie Image */}
      <div className="w-full h-[404px] rounded-[12px] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
        />
      </div>

      {/* Footer Info Row */}
      <div className="flex items-center justify-between w-full h-[36px]">
        {/* Duration Pill */}
        <div className="bg-bg-lighter border border-border-darker rounded-[51px] px-[10px] py-[6px] flex items-center gap-[4px] h-full">
          <Clock size={20} className="text-text-s" />
          <span className="text-text-s text-[16px] font-medium leading-none">
            {duration}
          </span>
        </div>

        {/* Rating/Views Pill */}
        <div className="bg-bg-lighter border border-border-darker rounded-[51px] px-[10px] py-[6px] flex items-center gap-[4px] h-full">
          <div className="flex items-center gap-[2px]">
            <Star size={18} fill="#E60000" stroke="#E60000" />
            <Star size={18} fill="#E60000" stroke="#E60000" />
            <Star size={18} fill="#E60000" stroke="#E60000" />
            <Star size={18} fill="#E60000" stroke="#E60000" />
            <div className="relative w-[18px] h-[18px]">
              <Star size={18} fill="#999999" stroke="#999999" />
              <div className="absolute inset-0 w-1/2 overflow-hidden">
                <Star size={18} fill="#E60000" stroke="#E60000" />
              </div>
            </div>
          </div>
          <span className="text-text-s text-[14px] font-medium leading-none ml-1">
            {views}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MustWatchCard;
