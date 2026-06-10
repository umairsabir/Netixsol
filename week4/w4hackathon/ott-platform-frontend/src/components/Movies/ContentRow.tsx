import React, { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PopularTop10Card from "./PopularTop10Card";
import TrendingCard from "./TrendingCard";
import NewReleaseCard from "./NewReleaseCard";
import MustWatchCard from "./MustWatchCard";

interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  duration?: string;
  views?: number;
  releaseYear?: number;
  category?: string;
  imdbRating?: number;
}

interface ContentRowProps {
  title: string;
  movies: Movie[];
  variant?: "standard" | "new-release" | "top-10" | "must-watch" | "trending";
  isLoading?: boolean;
}

const ContentRow: React.FC<ContentRowProps> = ({
  title,
  movies,
  variant = "standard",
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const hasDragged = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    hasDragged.current = false;
    scrollRef.current.classList.add("cursor-grabbing");
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const stopDragging = () => {
    setIsDragging(false);
    scrollRef.current?.classList.remove("cursor-grabbing");
    setTimeout(() => {
      hasDragged.current = false;
    }, 10);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDragged.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400; // Increased for larger cards
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
          : Math.min(Math.ceil(movies.length / 3) - 1, currentIndex + 1);
      setCurrentIndex(newIndex);
    }
  };

  const handleCardClick = (movie: Movie) => {
    if (hasDragged.current) return;
    navigate(`/movies/${movie.id}`);
  };

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[40px] md:gap-[100px]">
        <h2 className="text-[24px] md:text-[32px] desktop:text-[38px] font-bold text-text-p">
          {title}
        </h2>

        {/* Navigation Controls */}
        <div className="flex items-center gap-4 bg-[#0F0F0F] p-4 rounded-[12px] border border-[#1F1F1F]">
          <button
            onClick={() => scroll("left")}
            className="w-12 h-12 md:w-14 md:h-14 bg-[#1A1A1A] border border-[#1F1F1F] rounded-[8px] flex items-center justify-center text-text-p hover:bg-[#262626] transition-colors disabled:opacity-50"
          >
            <ArrowLeft size={24} />
          </button>

          {/* Indicators */}
          <div className="flex gap-[3px]">
            {[0, 1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-[23px] bg-primary"
                    : "w-[16px] bg-[#333333]"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="w-12 h-12 md:w-14 md:h-14 bg-[#1A1A1A] border border-[#1F1F1F] rounded-[8px] flex items-center justify-center text-text-p hover:bg-[#262626] transition-colors disabled:opacity-50"
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
        className="flex gap-[20px] md:gap-[30px] overflow-x-auto scrollbar-hide mt-[40px] md:mt-[50px] pb-4 select-none cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[240px] md:w-[350px] h-[300px] md:h-[450px] bg-surface animate-pulse rounded-[12px]"
            />
          ))
        ) : movies.length === 0 ? (
          <div className="w-full py-20 text-center text-text-s italic opacity-50 border border-dashed border-border-darker rounded-[12px]">
            No content available in this category.
          </div>
        ) : (
          movies.map((movie, idx) => (
            <div key={movie.id || idx} onClick={() => handleCardClick(movie)}>
              {variant === "top-10" ? (
                <PopularTop10Card title={movie.title} />
              ) : variant === "trending" ? (
                <TrendingCard
                  title={movie.title}
                  image={movie.posterUrl}
                  duration={movie.duration || "1h 30m"}
                  seasons="1 Season"
                />
              ) : variant === "must-watch" ? (
                <MustWatchCard
                  title={movie.title}
                  image={movie.posterUrl}
                  duration={movie.duration || "1h 30m"}
                  views={String(movie.views || 0)}
                />
              ) : variant === "new-release" ? (
                <NewReleaseCard
                  title={movie.title}
                  image={movie.posterUrl}
                  releaseDate={String(movie.releaseYear || 2023)}
                />
              ) : (
                <div className="flex-shrink-0 w-[280px] md:w-[320px] h-[350px] md:h-[400px] rounded-[12px] overflow-hidden group border border-border-darker hover:border-primary transition-all cursor-pointer p-4 bg-surface">
                  <div className="w-full h-full rounded-[8px] overflow-hidden relative">
                    <img
                      src={movie.posterUrl}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 select-none pointer-events-none"
                      alt={movie.title}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ContentRow;
