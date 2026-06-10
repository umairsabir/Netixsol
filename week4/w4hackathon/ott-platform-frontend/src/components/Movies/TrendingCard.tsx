import React from "react";
import { Clock, Layers } from "lucide-react";

interface TrendingCardProps {
  title: string;
  image: string;
  duration: string;
  seasons: string;
}

const TrendingCard: React.FC<TrendingCardProps> = ({
  title,
  image,
  duration,
  seasons,
}) => {
  return (
    <div className="bg-surface border border-border-darker rounded-[12px] p-[20px] flex flex-col gap-[20px] w-[359.25px] h-[444px] flex-shrink-0 cursor-pointer hover:border-primary transition-colors group">
      {/* Show Image */}
      <div className="w-full h-[348px] rounded-[12px] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
        />
      </div>

      {/* Footer Info Row */}
      <div className="flex items-center justify-between w-full h-[36px]">
        {/* Duration Pill */}
        <div className="bg-bg-lighter border border-border-darker rounded-[51px] px-[10px] py-[6px] h-full flex items-center gap-[4px]">
          <Clock size={20} className="text-text-s" />
          <span className="text-text-s text-[16px] font-medium leading-none">
            {duration}
          </span>
        </div>

        {/* Season Count Pill */}
        <div className="bg-bg-lighter border border-border-darker rounded-[51px] px-[10px] py-[6px] h-full flex items-center gap-[4px]">
          <Layers size={20} className="text-text-s" />
          <span className="text-text-s text-[16px] font-medium leading-none">
            {seasons}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrendingCard;
