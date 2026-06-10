import React from 'react';

interface MovieDescriptionProps {
  description: string;
}

const MovieDescription: React.FC<MovieDescriptionProps> = ({ description }) => {
  return (
    <div className="w-full bg-surface border border-border-darker rounded-[12px] p-[24px] md:p-[40px] flex flex-col gap-[14px]">
      <h3 className="text-text-s font-medium text-[16px] xl:text-[18px]">Description</h3>
      <p className="text-text-p font-medium text-[16px] xl:text-[18px] leading-[150%]">
        {description}
      </p>
    </div>
  );
};

export default MovieDescription;
