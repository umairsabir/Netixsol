import React from "react";

interface NewReleaseCardProps {
  title: string;
  image: string;
  releaseDate: string;
}

const NewReleaseCard: React.FC<NewReleaseCardProps> = ({
  title,
  image,
  releaseDate,
}) => {
  return (
    <div className="bg-surface border border-border-darker rounded-[12px] p-[20px] flex flex-col gap-[20px] w-[240px] md:w-[283.6px] h-auto md:h-[377px] flex-shrink-0 cursor-pointer hover:border-primary transition-colors group">
      {/* Image */}
      <div className="w-full h-[200px] md:h-[281px] rounded-[12px] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
        />
      </div>

      {/* Release Info Pill */}
      <div className="bg-bg-lighter border border-border-darker rounded-[51px] h-[36px] flex items-center justify-center px-[10px] w-full">
        <span className="text-text-s text-[14px] md:text-[16px] font-medium text-center truncate">
          Released at <span className="text-text-p">{releaseDate}</span>
        </span>
      </div>
    </div>
  );
};

export default NewReleaseCard;
