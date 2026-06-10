import React from 'react';
import { Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1489599848827-30998a83c8a9?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1440404809759-8e5777763241?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1478720568257-3dab4b4e2f4a?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300&auto=format&fit=crop",
];

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const { data: moviesData } = useQuery({
    queryKey: ['heroMarqueeMovies'],
    queryFn: async () => {
      const { data } = await api.get('/movies?limit=24&isPublished=true');
      return data.results as Array<{ id: string; posterUrl?: string }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build a de-duped poster list, fill gaps with fallbacks
  const moviePosters = (moviesData || [])
    .map((m) => m.posterUrl)
    .filter(Boolean) as string[];

  const baseImages = moviePosters.length >= 8
    ? moviePosters
    : [...moviePosters, ...FALLBACK_IMAGES].slice(0, Math.max(moviePosters.length + FALLBACK_IMAGES.length, 8));

  // Need ≥ 12 for a smooth marquee — repeat if short
  const padded = baseImages.length < 12
    ? [...baseImages, ...baseImages, ...baseImages]
    : baseImages;

  const marqueeImages = [...padded, ...padded]; // double for seamless loop

  const rows = [
    { key: 'r1', dir: 'animate-scroll-left', imgs: marqueeImages },
    { key: 'r2', dir: 'animate-scroll-right', imgs: [...marqueeImages].reverse() },
    { key: 'r3', dir: 'animate-scroll-left', imgs: marqueeImages.slice(marqueeImages.length / 2) },
    { key: 'r4', dir: 'animate-scroll-right', imgs: marqueeImages },
  ];

  return (
    <section className="relative w-full min-h-[700px] md:min-h-[860px] desktop:min-h-[1092px] flex flex-col justify-end items-center overflow-hidden bg-bg-custom mt-[0px] md:mt-[-64px] mb-[64px]">
      {/* Background Marquees */}
      <div className="absolute inset-x-0 top-0 h-full flex flex-col gap-[20px] py-[20px] opacity-30 pointer-events-none">
        {rows.map(({ key, dir, imgs }) => (
          <div key={key} className={`flex flex-row gap-[20px] w-max ${dir}`}>
            {imgs.map((src, i) => (
              <img
                key={`${key}-${i}`}
                src={src}
                className="w-[150px] h-[155px] md:w-[195px] md:h-[200px] rounded-[12px] object-cover"
                alt=""
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Fade Overlays */}
      <div className="absolute top-0 inset-x-0 h-[200px] md:h-[400px] bg-gradient-to-b from-bg-custom to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-[200px] md:h-[400px] bg-gradient-to-t from-transparent to-bg-custom z-10 pointer-events-none" />

      {/* Center Logo watermark */}
      <div className="absolute top-[18%] sm:top-[22%] md:top-[30%] desktop:top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <img
          src="/logo.svg"
          alt=""
          className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] md:w-[320px] md:h-[320px] desktop:w-[470px] desktop:h-[470px] opacity-20"
        />
      </div>

      {/* Bottom Content */}
      <div className="relative z-30 w-full max-w-[1920px] mx-auto px-4 md:px-20 lg:px-40 xl:px-60 desktop:px-[412px] flex flex-col items-center text-center gap-[30px] md:gap-[50px] pb-[40px] md:pb-[80px]">
        <div className="flex flex-col gap-[14px] items-center">
          <h1 className="text-[28px] sm:text-[36px] md:text-[58px] font-bold text-text-p leading-[1.3] md:leading-[150%]">
            The Best Streaming Experience
          </h1>
          <p className="text-[14px] md:text-[18px] text-text-s font-normal max-w-[1096px] leading-[1.6] md:leading-[150%]">
            StreamVibe is the best streaming experience for watching your favorite movies and shows on demand, anytime, anywhere. With StreamVibe, you can enjoy a wide variety of content, including the latest blockbusters, classic movies, popular TV shows, and more.
          </p>
        </div>
        <button
          onClick={() => navigate('/movies')}
          className="flex items-center justify-center gap-[4px] px-[24px] py-[18px] bg-primary text-text-p font-semibold text-[16px] md:text-[18px] rounded-[8px] hover:bg-red-700 transition-colors cursor-pointer h-[56px] md:h-[64px] min-w-[200px] md:min-w-[251px]"
        >
          <Play fill="currentColor" size={24} className="md:w-[28px] md:h-[28px]" />
          Start Watching Now
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
