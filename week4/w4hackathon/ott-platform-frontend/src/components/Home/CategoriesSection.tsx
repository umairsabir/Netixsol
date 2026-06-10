import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";

interface CategoriesSectionProps {
  title?: string;
  description?: string;
  showContainer?: boolean;
}

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300&auto=format&fit=crop";

// Each category card fetches its own 4 movie posters
const CategoryCard: React.FC<{
  category: any;
  onCategoryClick: (id: string) => void;
}> = ({ category, onCategoryClick }) => {
  const { data: moviesData } = useQuery({
    queryKey: ["categoryPosters", category.id],
    queryFn: async () => {
      const { data } = await api.get(
        `/movies?genre=${category.id}&limit=4&isPublished=true`,
      );
      return (data.results as Array<{ posterUrl?: string }>) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build 4-item poster array — fill gaps with category thumbnail or fallback
  const fallback = category.thumbnail || FALLBACK_POSTER;
  const posters: string[] = [0, 1, 2, 3].map(
    (i) => (moviesData?.[i]?.posterUrl) || fallback,
  );

  return (
    <div
      onClick={() => onCategoryClick(category.id)}
      className="min-w-[200px] md:min-w-[280px] xl:min-w-[320px] bg-surface border border-border-darker rounded-[12px] p-[16px] xl:p-[30px] flex flex-col cursor-pointer hover:border-primary transition-colors group snap-start pointer-events-auto"
    >
      <div className="relative isolate">
        <div className="grid grid-cols-2 gap-[5px]">
          {posters.map((src, item) => (
            <div
              key={item}
              className="w-full aspect-[4/5] bg-border-darker rounded-[10px] overflow-hidden"
            >
              <img
                src={src}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none select-none"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallback;
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(26, 26, 26, 0) 0%, var(--color-surface) 100%)",
          }}
        />
      </div>
      <div className="flex items-center justify-between z-[2] mt-[14px]">
        <span className="text-[16px] md:text-[18px] font-semibold text-text-p truncate pr-2">
          {category.name}
        </span>
        <ArrowRight
          size={24}
          className="text-text-p opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0"
        />
      </div>
    </div>
  );
};

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  title = "Explore our wide variety of categories",
  description = "Whether you're looking for a comedy to make you laugh, a drama to make you think, or a documentary to learn something new",
  showContainer = true,
}) => {
  const navigate = useNavigate();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftState, setScrollLeftState] = React.useState(0);
  const hasDragged = React.useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ["publicCategories"],
    queryFn: async () => {
      const { data } = await api.get(
        "/movies/categories?isActive=true&limit=10",
      );
      return data;
    },
  });

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const progress = scrollLeft / (scrollWidth - clientWidth);
    setScrollProgress(progress || 0);
  };

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
    if (!scrollRef.current) return;
    const scrollAmount = 600;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const categories = data?.results || [];

  const handleCategoryClick = (categoryId: string) => {
    if (hasDragged.current) return;
    navigate(`/movies?genre=${categoryId}`);
  };

  const content = (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[50px] md:gap-[100px]">
        <div className="flex flex-col max-w-[1141px]">
          <h2 className="text-[28px] md:text-[38px] font-bold text-text-p">
            {title}
          </h2>
          {description && (
            <p className="text-[14px] md:text-[18px] text-text-s font-normal mt-3">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 bg-[#0F0F0F] p-4 rounded-[12px] border border-[#1F1F1F]">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 md:w-14 md:h-14 bg-[#1A1A1A] border border-[#1F1F1F] rounded-[8px] flex items-center justify-center text-text-p hover:bg-[#262626] transition-colors"
          >
            <ArrowLeft size={24} className="md:w-7 md:h-7" />
          </button>

          <div className="flex gap-[3px]">
            {[0, 1, 2, 3].map((i) => {
              const isActive =
                scrollProgress * 3 >= i - 0.5 && scrollProgress * 3 < i + 0.5;
              return (
                <div
                  key={i}
                  className={`h-1 transition-all duration-300 rounded-full ${isActive ? "w-[23px] bg-primary" : "w-[16px] bg-[#333333]"}`}
                />
              );
            })}
          </div>

          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 md:w-14 md:h-14 bg-[#1A1A1A] border border-[#1F1F1F] rounded-[8px] flex items-center justify-center text-text-p hover:bg-[#262626] transition-colors"
          >
            <ArrowRight size={24} className="md:w-7 md:h-7" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={stopDragging}
        onMouseUp={stopDragging}
        onMouseMove={handleMouseMove}
        className="flex flex-row overflow-x-auto gap-[15px] xl:gap-[30px] mt-[50px] pb-4 scrollbar-hide select-none cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="min-w-[200px] md:min-w-[280px] bg-surface border border-border-darker rounded-[12px] p-[16px] xl:p-[30px] h-[250px] md:h-[300px] animate-pulse"
            >
              <div className="grid grid-cols-2 gap-[5px] h-full opacity-20">
                <div className="bg-border-darker rounded-[10px]" />
                <div className="bg-border-darker rounded-[10px]" />
                <div className="bg-border-darker rounded-[10px]" />
                <div className="bg-border-darker rounded-[10px]" />
              </div>
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="w-full py-20 text-center text-text-s italic opacity-50 border border-dashed border-border-darker rounded-[12px]">
            No categories available at the moment.
          </div>
        ) : (
          categories.map((category: any, idx: number) => (
            <CategoryCard
              key={category.id || idx}
              category={category}
              onCategoryClick={handleCategoryClick}
            />
          ))
        )}
      </div>
    </>
  );

  return (
    <section
      className={`w-full ${showContainer ? "mt-[100px] mb-[100px]" : ""}`}
    >
      {showContainer ? (
        <div className="w-full max-w-[1920px] mx-auto px-[15px] laptop:px-[80px] desktop:px-[162px]">
          {content}
        </div>
      ) : (
        content
      )}
    </section>
  );
};

export default CategoriesSection;

