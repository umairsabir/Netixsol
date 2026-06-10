import React, { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MovieCard from "./MovieCard";

const movieCategories = [
  {
    title: "Action",
    images: [
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489599848827-30998a83c8a9?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1440404809759-8e5777763241?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478720568257-3dab4b4e2f4a?w=300&auto=format&fit=crop",
    ],
  },
  {
    title: "Adventure",
    images: [
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489599848827-30998a83c8a9?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1440404809759-8e5777763241?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478720568257-3dab4b4e2f4a?w=300&auto=format&fit=crop",
    ],
  },
  {
    title: "Comedy",
    images: [
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489599848827-30998a83c8a9?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1440404809759-8e5777763241?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478720568257-3dab4b4e2f4a?w=300&auto=format&fit=crop",
    ],
  },
  {
    title: "Drama",
    tag: "New",
    images: [
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489599848827-30998a83c8a9?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1440404809759-8e5777763241?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478720568257-3dab4b4e2f4a?w=300&auto=format&fit=crop",
    ],
  },
  {
    title: "Horror",
    images: [
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489599848827-30998a83c8a9?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1440404809759-8e5777763241?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478720568257-3dab4b4e2f4a?w=300&auto=format&fit=crop",
    ],
  },
];

const MoviesShowsSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
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
    if (scrollRef.current) {
      const scrollAmount = 382; // Card width + gap
      const newScrollLeft =
        direction === "left"
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      const newIndex =
        direction === "left"
          ? Math.max(0, currentIndex - 1)
          : Math.min(movieCategories.length - 1, currentIndex + 1);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <section className="w-full mt-[50px] md:mt-[100px]">
      <div className="w-full max-w-[1920px] mx-auto px-[15px] laptop:px-[80px] desktop:px-[162px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-[50px] gap-5">
          <h2 className="text-[28px] md:text-[38px] font-bold text-text-p">
            Movies & Shows
          </h2>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 bg-surface p-4 rounded-[12px] border border-border-custom">
            <button
              onClick={() => scroll("left")}
              className="w-14 h-14 bg-bg-custom border border-border-custom rounded-[8px] flex items-center justify-center text-text-p hover:bg-border-custom transition-colors disabled:opacity-50"
              disabled={currentIndex === 0}
            >
              <ArrowLeft size={24} />
            </button>

            {/* Indicators */}
            <div className="flex gap-1">
              {movieCategories.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-[23px] bg-primary"
                      : "w-[16px] bg-border-custom"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="w-14 h-14 bg-bg-custom border border-border-custom rounded-[8px] flex items-center justify-center text-text-p hover:bg-border-custom transition-colors disabled:opacity-50"
              disabled={currentIndex === movieCategories.length - 1}
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        {/* Cards Carousel */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={stopDragging}
          onMouseUp={stopDragging}
          onMouseMove={handleMouseMove}
          className="flex gap-[30px] overflow-x-auto scrollbar-hide pb-4 select-none cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movieCategories.map((category, idx) => (
            <MovieCard
              key={idx}
              title={category.title}
              tag={category.tag}
              images={category.images}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoviesShowsSection;
