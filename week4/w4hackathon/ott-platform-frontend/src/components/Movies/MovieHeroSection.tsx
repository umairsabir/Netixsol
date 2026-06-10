import React from "react";
import { Play, Plus, ThumbsUp, Volume2, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";

const MovieHeroSection: React.FC = () => {
  const navigate = useNavigate();

  const { data: heroMovie, isLoading } = useQuery({
    queryKey: ['heroMovie'],
    queryFn: async () => {
      const { data } = await api.get('/movies?limit=1&sortBy=newest');
      return data.results[0];
    },
  });

  if (isLoading) {
    return <div className="w-full h-[500px] md:h-[700px] desktop:h-[835px] bg-surface animate-pulse rounded-[12px]" />;
  }

  // Fallback if no movie exists
  const displayMovie = heroMovie || {
    title: "No Content Available",
    description: "Upload content from the admin panel to get started.",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop"
  };

  return (
    <section className="relative w-full h-[500px] md:h-[700px] desktop:h-[835px] flex flex-col justify-end items-center overflow-hidden rounded-[12px]">
      {/* Background Image with Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${displayMovie.posterUrl})`,
        }}
      />

      {/* Gradient Overlay - matches design gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-lighter from-0% to-transparent to-100%" />

      {/* Main Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end items-center
        pb-[16px] px-[24px] gap-[20px]
        xl:pb-[16px] xl:px-[40px] xl:gap-[30px]
        desktop:pb-[20px] desktop:px-[50px] desktop:gap-[50px]
      ">
        
        {/* Sub Container (Text + Centered Action Buttons) */}
        <div className="flex flex-col items-center justify-end w-full max-w-[1494px]
          gap-[20px] 
          desktop:gap-[30px]
        ">
          
          {/* Text Container */}
          <div className="flex flex-col items-center w-full
            px-0 gap-[2px]
            xl:px-[100px]
            desktop:px-[150px] desktop:gap-[4px]
          ">
            <h1 className="font-bold text-center text-text-p
              text-[24px] 
              xl:text-[30px] 
              desktop:text-[38px]
            ">
              {displayMovie.title}
            </h1>
            <p className="hidden md:block font-medium text-center text-text-s leading-[150%] max-w-[1194px]
              xl:text-[16px]
              desktop:text-[18px]
            ">
              {displayMovie.description}
            </p>
          </div>

          {/* Center Buttons Container */}
          <div className="flex flex-col md:flex-row items-center
            gap-[10px] md:gap-[16px] desktop:gap-[20px]
          ">
            
            {/* Play Button */}
            <button 
              onClick={() => displayMovie.id && navigate(`/movies/${displayMovie.id || displayMovie._id}`)}
              className="flex items-center justify-center font-semibold text-text-p rounded-[8px] bg-primary hover:bg-red-700 transition-colors
              w-full md:w-auto
              h-[44px] px-[16px] gap-[4px] text-[16px]
              xl:h-[52px] xl:px-[20px]
              desktop:h-[56px] desktop:px-[24px] desktop:text-[18px]
            ">
              <Play fill="currentColor" className="w-[20px] h-[20px] xl:w-[24px] xl:h-[24px] desktop:w-[28px] desktop:h-[28px]" />
              Play Now
            </button>

            {/* Icons Container */}
            <div className="flex flex-row items-center gap-[8px] desktop:gap-[10px]">
              <button className="flex items-center justify-center bg-bg-custom border border-border-darker rounded-[8px] text-text-p hover:bg-surface transition-colors
                w-[44px] h-[44px]
                xl:w-[48px] xl:h-[48px]
                desktop:w-[56px] desktop:h-[56px]
              ">
                <Plus className="w-[20px] h-[20px] xl:w-[24px] xl:h-[24px] desktop:w-[28px] desktop:h-[28px]" />
              </button>
              <button className="flex items-center justify-center bg-bg-custom border border-border-darker rounded-[8px] text-text-p hover:bg-surface transition-colors
                w-[44px] h-[44px]
                xl:w-[48px] xl:h-[48px]
                desktop:w-[56px] desktop:h-[56px]
              ">
                <ThumbsUp className="w-[20px] h-[20px] xl:w-[24px] xl:h-[24px] desktop:w-[28px] desktop:h-[28px]" />
              </button>
              <button className="flex items-center justify-center bg-bg-custom border border-border-darker rounded-[8px] text-text-p hover:bg-surface transition-colors
                w-[44px] h-[44px]
                xl:w-[48px] xl:h-[48px]
                desktop:w-[56px] desktop:h-[56px]
              ">
                <Volume2 className="w-[20px] h-[20px] xl:w-[24px] xl:h-[24px] desktop:w-[28px] desktop:h-[28px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Row (Arrows + Indicators) */}
        <div className="flex flex-row items-center justify-between w-full max-w-[1494px] gap-[16px]">
          
          {/* Left Arrow */}
          <button className="hidden md:flex items-center justify-center bg-bg-custom border border-border-custom rounded-[8px] text-text-p hover:bg-surface transition-colors
            xl:w-[48px] xl:h-[48px] 
            desktop:w-[56px] desktop:h-[56px]
          ">
            <ChevronLeft className="w-[24px] h-[24px] desktop:w-[28px] desktop:h-[28px]" />
          </button>
          
          {/* Indicators Container (Centered implicitly if arrows exist, margin auto on arrows pushes it to middle) */}
          <div className="flex items-center flex-row gap-[3px] mx-auto">
             <div className="w-[23px] h-[4px] bg-primary rounded-full"></div>
             <div className="w-[16px] h-[4px] bg-neutral-dark rounded-full"></div>
             <div className="w-[16px] h-[4px] bg-neutral-dark rounded-full"></div>
             <div className="w-[16px] h-[4px] bg-neutral-dark rounded-full"></div>
          </div>

          {/* Right Arrow */}
          <button className="hidden md:flex items-center justify-center bg-bg-custom border border-border-custom rounded-[8px] text-text-p hover:bg-surface transition-colors
            xl:w-[48px] xl:h-[48px] 
            desktop:w-[56px] desktop:h-[56px]
          ">
            <ChevronRight className="w-[24px] h-[24px] desktop:w-[28px] desktop:h-[28px]" />
          </button>
        </div>
        
      </div>
    </section>
  );
};

export default MovieHeroSection;
