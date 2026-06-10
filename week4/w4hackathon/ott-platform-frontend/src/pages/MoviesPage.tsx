import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Filter } from 'lucide-react';
import MovieHeroSection from '../components/Movies/MovieHeroSection';
import CategoriesSection from '../components/Home/CategoriesSection';
import ContentRow from '../components/Movies/ContentRow';
import CTASection from '../components/Home/CTASection';
import api from '../lib/axios';

const MoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = searchParams.get('genre');
  const search = searchParams.get('search');

  const isFiltered = !!(genreId || search);

  // Fetch Movies Rows
  const { data: moviesTrending = [], isLoading: isTrendingLoading } = useQuery({
    queryKey: ['moviesTrending'],
    queryFn: async () => (await api.get('/movies?category=movie&sortBy=views:desc&limit=10&isPublished=true')).data.results,
    enabled: !isFiltered
  });

  const { data: moviesNew = [], isLoading: isNewLoading } = useQuery({
    queryKey: ['moviesNew'],
    queryFn: async () => (await api.get('/movies?category=movie&sortBy=releaseYear:desc&limit=10&isPublished=true')).data.results,
    enabled: !isFiltered
  });

  const { data: moviesMustWatch = [], isLoading: isMustWatchLoading } = useQuery({
    queryKey: ['moviesMustWatch'],
    queryFn: async () => (await api.get('/movies?category=movie&limit=10&isPublished=true')).data.results,
    enabled: !isFiltered
  });

  // Fetch Shows Rows
  const { data: showsTrending = [], isLoading: isShowsTrendingLoading } = useQuery({
    queryKey: ['showsTrending'],
    queryFn: async () => (await api.get('/movies?category=show&sortBy=views:desc&limit=10&isPublished=true')).data.results,
    enabled: !isFiltered
  });

  const { data: showsNew = [], isLoading: isShowsNewLoading } = useQuery({
    queryKey: ['showsNew'],
    queryFn: async () => (await api.get('/movies?category=show&sortBy=releaseYear:desc&limit=10&isPublished=true')).data.results,
    enabled: !isFiltered
  });

  const { data: showsMustWatch = [], isLoading: isShowsMustWatchLoading } = useQuery({
    queryKey: ['showsMustWatch'],
    queryFn: async () => (await api.get('/movies?category=show&limit=10&isPublished=true')).data.results,
    enabled: !isFiltered
  });

  // Filtered Query
  const { data: filteredResults = [], isLoading: isFilteredLoading } = useQuery({
    queryKey: ['moviesFiltered', genreId, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (genreId) params.append('genre', genreId);
      if (search) params.append('search', search);
      params.append('limit', '50');
      params.append('isPublished', 'true');
      const { data } = await api.get(`/movies?${params.toString()}`);
      return data.results;
    },
    enabled: isFiltered
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['publicCategories'],
    queryFn: async () => (await api.get('/movies/categories?isActive=true')).data,
  });

  const categories = categoriesData?.results || [];

  const activeGenreName = useMemo(() => {
    if (!genreId) return null;
    return categories.find((c: any) => c.id === genreId)?.name || 'Category';
  }, [genreId, categories]);

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="w-full bg-bg-custom flex flex-col items-center">
      {/* Hero Section - Hide when filtered to focus on results */}
      {!isFiltered && (
        <div className="w-full mt-[40px] desktop:mt-[50px] px-[15px] laptop:px-[80px] desktop:px-[162px]">
          <MovieHeroSection />
        </div>
      )}

      {/* Filtered Content View */}
      {isFiltered && (
        <div className="w-full max-w-[1920px] mx-auto mt-[60px] md:mt-[80px] px-[15px] laptop:px-[80px] desktop:px-[160px] min-h-[60vh]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-[8px]">
                      <Filter size={20} className="text-primary" />
                   </div>
                   <h1 className="text-text-p text-[28px] md:text-[34px] font-bold">
                    {search ? `Search results for "${search}"` : `${activeGenreName} Collection`}
                  </h1>
                </div>
                <p className="text-text-s text-[14px] md:text-[16px]">
                  Showing {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
                </p>
              </div>
              <button 
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border-darker hover:border-primary text-text-p rounded-[12px] transition-all font-semibold"
              >
                <X size={18} /> Clear Filters
              </button>
            </div>

            {isFilteredLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-surface animate-pulse rounded-[12px]" />
                ))}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="w-full py-32 flex flex-col items-center justify-center border border-dashed border-border-darker rounded-[20px] bg-surface/30">
                <div className="w-16 h-16 bg-border-darker rounded-full flex items-center justify-center mb-4 text-text-s opacity-30">
                  <Filter size={32} />
                </div>
                <h3 className="text-text-p text-[20px] font-bold">No results found</h3>
                <p className="text-text-s mt-2">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="mt-6 text-primary font-bold hover:underline">Back to all movies</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-10">
                {filteredResults.map((movie: any) => (
                  <div 
                    key={movie.id} 
                    className="flex flex-col gap-3 group cursor-pointer"
                    onClick={() => navigate(`/movies/${movie.id || movie._id}`)}
                  >
                    <div className="relative aspect-[2/3] rounded-[12px] overflow-hidden border border-border-darker group-hover:border-primary transition-all shadow-lg">
                       <img 
                        src={movie.posterUrl} 
                        alt={movie.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       />
                       {movie.isPremium && (
                         <div className="absolute top-3 right-3 bg-primary text-text-p text-[10px] font-bold px-2 py-1 rounded-[4px] shadow-lg">
                           PREMIUM
                         </div>
                       )}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-text-p font-semibold truncate group-hover:text-primary transition-colors">{movie.title}</h3>
                      <div className="flex items-center gap-2 text-text-s text-[12px]">
                        <span>{movie.releaseYear}</span>
                        <span>•</span>
                        <span>{movie.duration || '2h'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Browse Sections - Only show when not filtered */}
      {!isFiltered && (
        <>
          {/* Movies Content wrapper */}
          <div className="w-full max-w-[1920px] mx-auto relative mt-[100px] md:mt-[150px] desktop:mt-[180px] px-[15px] laptop:px-[80px] desktop:px-[160px]">
            <div className="border border-border-darker rounded-[12px] p-[20px] lg:p-[50px] flex flex-col gap-[60px] lg:gap-[100px] relative mt-[30px]">
              {/* Legend Button */}
              <div className="absolute top-[0px] transform -translate-y-1/2 left-[30px] lg:left-[50px] z-10">
                <span className="inline-flex items-center justify-center px-6 py-[10px] bg-primary text-text-p font-semibold text-[18px] md:text-[20px] rounded-[8px] h-[44px] md:h-[50px]">
                  Movies
                </span>
              </div>
              
              <CategoriesSection title="Our Genres" description="" showContainer={false} />
              
              <ContentRow title="Popular Top 10 In Genres" movies={moviesTrending.slice(0, 10)} variant="top-10" isLoading={isTrendingLoading} />
              <ContentRow title="Trending Now" movies={moviesTrending} variant="trending" isLoading={isTrendingLoading} />
              <ContentRow title="New Releases" movies={moviesNew} variant="new-release" isLoading={isNewLoading} />
              <ContentRow title="Must Watch Movies" movies={moviesMustWatch} variant="must-watch" isLoading={isMustWatchLoading} />
            </div>
          </div>

          {/* Shows Content wrapper */}
          <div className="w-full max-w-[1920px] mx-auto relative mt-[150px] md:mt-[180px] desktop:mt-[200px] px-[15px] laptop:px-[80px] desktop:px-[160px]">
            <div className="border border-border-darker rounded-[12px] p-[20px] lg:p-[50px] flex flex-col gap-[60px] lg:gap-[100px] relative mt-[30px]">
              {/* Legend Button */}
              <div className="absolute top-[0px] transform -translate-y-1/2 left-[30px] lg:left-[50px] z-10">
                <span className="inline-flex items-center justify-center px-6 py-[10px] bg-primary text-text-p font-semibold text-[18px] md:text-[20px] rounded-[8px] h-[44px] md:h-[50px]">
                  Shows
                </span>
              </div>
              
              <CategoriesSection title="Our Genres" description="" showContainer={false} />
              
              <ContentRow title="Popular Top 10 In Genres" movies={showsTrending.slice(0, 10)} variant="top-10" isLoading={isShowsTrendingLoading} />
              <ContentRow title="Trending Now" movies={showsTrending} variant="trending" isLoading={isShowsTrendingLoading} />
              <ContentRow title="New Releases" movies={showsNew} variant="new-release" isLoading={isShowsNewLoading} />
              <ContentRow title="Must Watch Shows" movies={showsMustWatch} variant="must-watch" isLoading={isShowsMustWatchLoading} />
            </div>
          </div>
        </>
      )}

      <CTASection />
    </div>
  );
};

export default MoviesPage;
