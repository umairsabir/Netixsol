import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Lock } from 'lucide-react';
import MovieOpenHero from '../components/MovieDetails/MovieOpenHero';
import MovieDescription from '../components/MovieDetails/MovieDescription';
import CastCarousel from '../components/MovieDetails/CastCarousel';
import ReviewsSection from '../components/MovieDetails/ReviewsSection';
import MovieInfoSidebar from '../components/MovieDetails/MovieInfoSidebar';
import CTASection from '../components/Home/CTASection';
import VideoPlayer from '../components/VideoPlayer';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';

const MovieOpenPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: movie, isLoading: isMovieLoading, error: movieError } = useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const { data } = await api.get(`/movies/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const { data: playData, isLoading: isPlayLoading, error: playError } = useQuery({
    queryKey: ['playMovie', id],
    queryFn: async () => {
      const { data } = await api.get(`/movies/${id}/play`);
      return data;
    },
    enabled: !!id && isPlaying,
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['movieReviews', id],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/${id}`);
      return data;
    },
    enabled: !!id,
  });

  if (isMovieLoading) return <div className="min-h-screen bg-bg-custom flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  
  if (movieError || !movie) return (
    <div className="min-h-screen bg-bg-custom flex flex-col items-center justify-center gap-4">
      <AlertCircle size={48} className="text-primary" />
      <h2 className="text-text-p text-2xl font-bold">Movie not found</h2>
      <button onClick={() => navigate('/movies')} className="text-primary hover:underline">Back to Movies</button>
    </div>
  );

  const handlePlay = () => {
    // Basic auth check
    if (movie?.isPremium && !isAuthenticated) {
      navigate('/login', { state: { from: `/movies/${id}` } });
      return;
    }
    
    // Reset any previous errors
    setIsPlaying(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Improved play error handling
  const getPlayErrorStatus = () => {
    if (!playError) return null;
    const axiosError = playError as any;
    return axiosError.response?.status;
  };

  const playErrorStatus = getPlayErrorStatus();
  const isAccessDenied = playErrorStatus === 401 || playErrorStatus === 402 || playErrorStatus === 403;
  const isGenericPlayError = !!playError && !isAccessDenied;

  return (
    <div className="w-full bg-bg-custom min-h-screen flex flex-col items-center">
      
      <div className="w-full mt-[40px] desktop:mt-[50px] px-[15px] laptop:px-[80px] desktop:px-[162px]">
        {isPlaying ? (
          <div className="w-full max-w-[1596px] mx-auto">
            {isPlayLoading ? (
              <div className="aspect-video bg-surface border border-border-darker rounded-[12px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-text-s text-[14px]">Preparing your stream...</p>
                </div>
              </div>
            ) : isAccessDenied || playErrorStatus === 402 ? (
              <div className="aspect-video bg-surface border border-border-darker rounded-[12px] flex flex-col items-center justify-center p-8 text-center gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock size={40} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-text-p text-[24px] font-bold">
                    {playErrorStatus === 402 ? "Subscription Required" : "Access Denied"}
                  </h2>
                  <p className="text-text-s text-[16px] mt-2 max-w-[500px]">
                    {playErrorStatus === 402 
                      ? "This content is premium. Please upgrade your plan to continue watching." 
                      : "You do not have permission to view this content."}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsPlaying(false)} className="px-6 py-3 bg-bg-custom border border-border-darker text-text-p rounded-[8px] font-semibold hover:bg-surface transition-colors">Go Back</button>
                  <button onClick={() => navigate('/plans')} className="px-8 py-3 bg-primary text-text-p rounded-[8px] font-semibold hover:bg-red-700 transition-colors">View Plans</button>
                </div>
              </div>
            ) : isGenericPlayError ? (
              <div className="aspect-video bg-surface border border-border-darker rounded-[12px] flex flex-col items-center justify-center p-8 text-center gap-4">
                <AlertCircle size={40} className="text-primary" />
                <h2 className="text-text-p text-[20px] font-bold">Failed to load stream</h2>
                <p className="text-text-s text-[14px]">
                  {(playError as any)?.response?.data?.message || "There was an error initializing the player. This might be due to processing delay or connection issues."}
                </p>
                <button onClick={() => setIsPlaying(false)} className="mt-2 px-6 py-2 bg-primary text-text-p rounded-[8px] font-semibold transition-colors">Go Back</button>
              </div>
            ) : playData ? (
              <VideoPlayer 
                src={playData.hlsUrl || playData.streamUrl || playData.mp4Url || movie.videoUrl} 
                poster={movie.posterUrl} 
                title={movie.title} 
                onBack={() => setIsPlaying(false)} 
              />
            ) : null}
          </div>
        ) : (
          <MovieOpenHero movie={{
            title: movie.title,
            description: movie.description,
            image: movie.posterUrl
          }} onPlay={handlePlay} />
        )}
      </div>

      <div className="w-full max-w-[1920px] mx-auto mt-[40px] xl:mt-[100px] desktop:mt-[150px] px-[15px] laptop:px-[80px] desktop:px-[162px]">
        <div className="flex flex-col xl:flex-row gap-[20px] desktop:gap-[30px]">
          <div className="flex flex-col flex-[2] min-w-0 gap-[20px] desktop:gap-[30px]">
             <MovieDescription description={movie.description} />
             <div className="flex flex-col gap-[20px] xl:gap-[30px]">
              <CastCarousel cast={movie.cast || []} />
              <ReviewsSection 
                movieId={id!} 
                reviews={reviews} 
                onReviewAdded={() => refetchReviews()} 
              />
            </div>
          </div>
          
          <div className="flex flex-col flex-1 gap-[20px] desktop:gap-[30px]">
             <MovieInfoSidebar movie={{
               releaseYear: String(movie.releaseYear),
               languages: movie.language || ["English"],
               ratings: { imdb: movie.imdbRating || 0, streamvibe: movie.streamvibeRating || 0 },
               genres: movie.genres || [],
               director: { 
                 name: typeof movie.director === 'object' ? movie.director?.name : (movie.director || "Unknown"), 
                 origin: typeof movie.director === 'object' ? (movie.director?.origin || "Director") : "Director", 
                 image: typeof movie.director === 'object' ? (movie.director?.image || "") : "" 
               },
               music: { 
                 name: typeof movie.music === 'object' ? movie.music?.name : (movie.music || "Unknown"), 
                 origin: typeof movie.music === 'object' ? (movie.music?.origin || "Composer") : "Composer", 
                 image: typeof movie.music === 'object' ? (movie.music?.image || "") : "" 
               }
             }} />
          </div>
        </div>
      </div>
      
      <CTASection />
    </div>
  );
};

export default MovieOpenPage;
