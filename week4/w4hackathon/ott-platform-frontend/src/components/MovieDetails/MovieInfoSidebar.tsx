import React from 'react';
import { Calendar, Languages, Star, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  movie: {
    releaseYear: string;
    languages: string[];
    ratings: {
      imdb: number;
      streamvibe: number;
    };
    genres: { id?: string; _id?: string; name: string }[];
    director: {
      name: string;
      origin: string;
      image: string;
    };
    music: {
      name: string;
      origin: string;
      image: string;
    };
  };
}

const StarRatingBadge = ({ title, rating }: { title: string, rating: number }) => {
  return (
    <div className="flex flex-col items-start gap-[10px] p-[14px_16px] bg-bg-custom border border-border-darker rounded-[8px] flex-1">
       <span className="text-text-p font-medium text-[14px] xl:text-[16px]">{title}</span>
       <div className="flex flex-row items-center gap-[4px]">
          <div className="flex flex-row gap-[2px]">
            {[1,2,3,4,5].map(star => {
               if (star <= Math.floor(rating)) {
                 return <Star key={star} size={18} fill="#E60000" stroke="#E60000" className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px]" />;
               } else if (star === Math.ceil(rating) && rating % 1 !== 0) {
                 return (
                   <div key={star} className="relative w-[16px] h-[16px] xl:w-[18px] xl:h-[18px]">
                     <Star className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px]" fill="#999999" stroke="#999999" />
                     <div className="absolute inset-0 w-1/2 overflow-hidden">
                       <Star className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px]" fill="#E60000" stroke="#E60000" />
                     </div>
                   </div>
                 );
               } else {
                 return <Star key={star} size={18} fill="#999999" stroke="#999999" className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px]" />;
               }
            })}
          </div>
          <span className="text-text-p font-medium text-[14px] xl:text-[16px] ml-[2px]">{rating}</span>
       </div>
    </div>
  );
};

const Tag = ({ text }: { text: string }) => (
  <span className="bg-bg-custom border border-border-darker text-text-p font-medium text-[14px] xl:text-[16px] px-[14px] py-[8px] rounded-[8px]">
    {text}
  </span>
);

const ProfileCard = ({ profile }: { profile: {name: string, origin: string, image: string} }) => (
  <div className="flex flex-row items-center gap-[10px] bg-bg-custom border border-border-darker p-[14px] rounded-[8px] w-full">
    <div className="w-[50px] h-[50px] rounded-[8px] overflow-hidden flex-shrink-0 bg-bg-darker flex items-center justify-center">
      {profile.image ? (
        <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[20px]">👤</span>
      )}
    </div>
    <div className="flex flex-col">
      <h4 className="text-text-p font-medium text-[16px] xl:text-[18px]">{profile.name}</h4>
      <span className="text-text-s text-[14px] xl:text-[16px]">{profile.origin}</span>
    </div>
  </div>
);

const MovieInfoSidebar: React.FC<SidebarProps> = ({ movie }) => {
  return (
    <div className="w-full bg-surface border border-border-darker rounded-[12px] p-[24px] xl:p-[40px] flex flex-col gap-[30px] xl:gap-[40px]">
      
      {/* Released Year */}
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center gap-[6px] text-text-s">
          <Calendar className="w-[20px] h-[20px] xl:w-[24px] xl:h-[24px]" />
          <span className="font-medium text-[16px] xl:text-[18px]">Released Year</span>
        </div>
        <div className="text-text-p font-semibold text-[18px] xl:text-[20px]">
          {movie.releaseYear}
        </div>
      </div>

      {/* Languages */}
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center gap-[6px] text-text-s">
          <Languages className="w-[20px] h-[20px] xl:w-[24px] xl:h-[24px]" />
          <span className="font-medium text-[16px] xl:text-[18px]">Available Languages</span>
        </div>
        <div className="flex flex-row flex-wrap gap-[10px]">
          {movie.languages.map(lang => (
            <Tag key={lang} text={lang} />
          ))}
        </div>
      </div>

      {/* Ratings */}
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center gap-[6px] text-text-s">
          <Star className="w-[20px] h-[20px] xl:w-[24px] xl:h-[24px]" />
          <span className="font-medium text-[16px] xl:text-[18px]">Ratings</span>
        </div>
        <div className="flex flex-row gap-[10px] xl:gap-[20px] w-full">
           <StarRatingBadge title="IMDb" rating={movie.ratings.imdb} />
           <StarRatingBadge title="Streamvibe" rating={movie.ratings.streamvibe} />
        </div>
      </div>

      {/* Genres */}
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center gap-[6px] text-text-s">
          <LayoutGrid className="w-[20px] h-[20px] xl:w-[24px] xl:h-[24px]" />
          <span className="font-medium text-[16px] xl:text-[18px]">Genres</span>
        </div>
        <div className="flex flex-row flex-wrap gap-[10px]">
          {movie.genres.map((genre: any, idx: number) => (
            <Tag key={genre.id || genre._id || idx} text={genre.name || genre} />
          ))}
        </div>
      </div>

      {/* Director */}
      <div className="flex flex-col gap-[10px]">
        <div className="text-text-s font-medium text-[16px] xl:text-[18px]">
          Director
        </div>
        <ProfileCard profile={movie.director} />
      </div>

      {/* Music */}
      <div className="flex flex-col gap-[10px]">
        <div className="text-text-s font-medium text-[16px] xl:text-[18px]">
           Music
        </div>
        <ProfileCard profile={movie.music} />
      </div>

    </div>
  );
};

export default MovieInfoSidebar;
