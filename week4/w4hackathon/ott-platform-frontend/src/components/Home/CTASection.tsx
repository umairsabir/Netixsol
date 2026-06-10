import React from "react";

const CTASection: React.FC = () => {
  return (
    <section className="w-full mt-[100px] mb-[100px]">
      <div className="w-full max-w-[1920px] mx-auto px-[15px] laptop:px-[80px] desktop:px-[162px]">
        {/* Main Background Container */}
        <div className="relative w-full min-h-[313px] border border-border-darker rounded-[12px] flex flex-col md:flex-row items-center justify-between p-8 md:p-[80px] desktop:p-[100px_80px] overflow-hidden"
             style={{ background: "#0F0F0F" }}>
          
          {/* Background Images Overlay */}
          <div 
            className="absolute flex flex-col gap-[20px] z-0 pointer-events-none"
            style={{
              width: "1646px",
              height: "395px",
              left: "calc(50% - 1646px/2 + 25px)",
              top: "calc(50% - 395px/2)"
            }}
          >
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="flex gap-[20px] h-full flex-nowrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
                  <div key={col} className="w-[165.11px] h-[83.75px] rounded-[10px] bg-[#1A1A1A] overflow-hidden flex-shrink-0">
                    <img
                      src={`https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=200&auto=format&fit=crop`}
                      alt="movie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Fade-out Gradient - EXACT FIGMA STOPS */}
          <div 
            className="absolute z-[1]"
            style={{
              width: "1646px",
              height: "344px",
              right: "0px",
              top: "calc(50% - 344px/2 + 0.5px)",
              background: "linear-gradient(89.97deg, #0F0F0F 2.42%, rgba(20, 15, 15, 0.974681) 25.46%, rgba(34, 14, 14, 0.909574) 46.72%, rgba(229, 0, 0, 0) 168.98%)",
              mixBlendMode: "normal"
            }}
          />

          {/* Content Area */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full h-full gap-8 md:gap-[50px] lg:gap-[100px]">
            <div className="flex flex-col items-start gap-[10px] md:gap-[14px] flex-1">
              <h2 className="text-[32px] md:text-[40px] desktop:text-[48px] font-bold text-text-p leading-[150%] max-w-[1148px]">
                Start your free trial today!
              </h2>
              <p className="text-[16px] md:text-[18px] text-text-s font-normal leading-[150%] max-w-[1148px]">
                This is a clear and concise call to action that encourages users to sign up for a free trial of StreamVibe.
              </p>
            </div>
            
            <button className="flex items-center justify-center bg-primary text-text-p font-semibold text-[18px] rounded-[8px] hover:bg-red-700 transition-colors
              px-[24px] py-[18px] min-w-[188px] h-[63px]">
              Start a Free Trail
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTASection;
