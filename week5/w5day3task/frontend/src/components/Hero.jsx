import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="flex flex-col md:flex-row items-center min-h-[80vh] bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
            {/* Left Image Section */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-auto self-stretch">
                <img 
                    src="/images/Landing Main Image.png" 
                    alt="Tea leaves in spoons" 
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Right Content Section */}
            <div className="w-full md:w-1/2 p-8 md:p-24 flex flex-col justify-center">
                <h1 className="text-[26px] md:text-[50px] font-normal leading-tight mb-8 text-[#1A1A1A] dark:text-white font-['Prosto_One']">
                    Every day is unique,<br />just like our tea
                </h1>
                <div className="space-y-6 text-black dark:text-gray-300 text-sm md:text-base leading-relaxed max-w-lg mb-10">
                    <p>
                        Lorem ipsum dolor sit amet consectetur. Orci nibh nullam risus adipiscing odio. Neque lacus nibh eros in.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet consectetur. Orci nibh nullam risus adipiscing odio. Neque lacus nibh eros in.
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/collections/chai')}
                    className="bg-[#2A2A2A] dark:bg-white text-white dark:text-black text-[12px] font-bold tracking-[0.2em] py-5 px-12 w-fit hover:bg-black dark:hover:bg-gray-200 transition-all uppercase cursor-pointer"
                >
                    Browse Teas
                </button>
            </div>
        </section>
    );
};

export default Hero;
