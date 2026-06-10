import React, { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CastCarouselProps {
  cast: {
    name: string;
    image?: string;
  }[];
}

const CastCarousel: React.FC<CastCarouselProps> = ({ cast }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    scrollRef.current.classList.add("cursor-grabbing");
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const stopDragging = () => {
    setIsDragging(false);
    scrollRef.current?.classList.remove("cursor-grabbing");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!cast || cast.length === 0) {
    return (
      <div className="w-full bg-surface border border-border-darker rounded-[12px] p-[24px] xl:p-[40px]">
        <h3 className="text-text-s font-medium text-[16px] xl:text-[18px] mb-4">
          Cast
        </h3>
        <p className="text-text-s text-[14px]">
          No cast information available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-border-darker rounded-[12px] p-[24px] xl:p-[40px] flex flex-col gap-[30px] xl:gap-[40px]">
      {/* Header */}
      <div className="flex flex-row items-center justify-between w-full">
        <h3 className="text-text-s font-medium text-[16px] xl:text-[18px]">
          Cast
        </h3>
        <div className="flex flex-row gap-[10px] xl:gap-[16px]">
          <button
            onClick={() => scroll("left")}
            className="w-[44px] h-[44px] xl:w-[56px] xl:h-[56px] rounded-full bg-bg-custom border border-border-darker flex justify-center items-center text-text-p hover:bg-border-darker transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-[20px] h-[20px] xl:w-[28px] xl:h-[28px]" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-[44px] h-[44px] xl:w-[56px] xl:h-[56px] rounded-full bg-bg-custom border border-border-darker flex justify-center items-center text-text-p hover:bg-border-darker transition-colors cursor-pointer"
          >
            <ArrowRight className="w-[20px] h-[20px] xl:w-[28px] xl:h-[28px]" />
          </button>
        </div>
      </div>

      {/* Cast Scrollable Row */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={stopDragging}
        onMouseUp={stopDragging}
        onMouseMove={handleMouseMove}
        className="w-full overflow-x-auto scrollbar-hide pb-2 select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex flex-row gap-[10px] xl:gap-[20px]">
          {cast.map((actor, idx) => (
            <div
              key={actor.name + idx}
              className="flex flex-col gap-2 flex-shrink-0 group"
            >
              <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] xl:w-[105px] xl:h-[105px] rounded-[10px] overflow-hidden bg-bg-darker border border-border-darker flex items-center justify-center">
                {actor.image ? (
                  <img
                    src={actor.image}
                    alt={actor.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 select-none pointer-events-none"
                  />
                ) : (
                  <span className="text-[24px]">👤</span>
                )}
              </div>
              <p className="text-[12px] text-center text-text-s font-medium truncate max-w-[80px] md:max-w-[100px]">
                {actor.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CastCarousel;
