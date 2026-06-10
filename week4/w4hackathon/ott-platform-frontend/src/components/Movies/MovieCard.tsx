import React from "react";
import { ChevronRight } from "lucide-react";

interface MovieCardProps {
  title: string;
  tag?: string;
  images: string[];
}

const MovieCard: React.FC<MovieCardProps> = ({ title, tag, images }) => {
  return (
    <div className="bg-surface border border-border-custom rounded-[12px] p-[30px] flex flex-col cursor-pointer hover:border-primary transition-colors group min-w-[275px] lg:min-w-[352px] h-[342px] lg:h-[378px]">
      {/* Image Grid Container */}
      <div className="relative flex-1 mb-[5px] overflow-hidden rounded-[10px]">
        {/* 2x2 Image Grid */}
        <div className="grid grid-cols-2 gap-[5px] lg:gap-[10px] h-full">
          {images.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              className="w-full h-full bg-bg-custom rounded-[4px] lg:rounded-[10px] overflow-hidden"
            >
              <img
                src={img}
                alt={`${title} ${idx + 1}`}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity select-none pointer-events-none"
              />
            </div>
          ))}
        </div>

        {/* Fade Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
      </div>

      {/* Title and Arrow */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          {tag && (
            <span className="text-[14px] font-semibold text-text-p bg-primary px-[10px] py-[4px] rounded-[5px] w-fit">
              {tag}
            </span>
          )}
          <h3 className="text-[16px] lg:text-[20px] font-semibold text-text-p">
            {title}
          </h3>
        </div>
        <ChevronRight
          size={24}
          className="text-text-p opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0"
        />
      </div>
    </div>
  );
};

export default MovieCard;
