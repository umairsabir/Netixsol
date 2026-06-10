import React from 'react';

const collections = [
    { name: "BLACK TEA", image: "/images/Image Holder.png" },
    { name: "GREEN TEA", image: "/images/Image Hlder.png" },
    { name: "WHITE TEA", image: "/images/Image Holder (1).png" },
    { name: "MATCHA", image: "/images/Image Holder (2).png" },
    { name: "HERBAL TEA", image: "/images/Image Holder (3).png" },
    { name: "CHAI", image: "/images/Image Holder (4).png" },
    { name: "OOLONG", image: "/images/Image Holder (5).png" },
    { name: "ROOIBOS", image: "/images/Image Holder (6).png" },
    { name: "TEAWARE", image: "/images/Image Holder (7).png" },
];

const Collections = () => {
    return (
        <section className="py-20 bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl font-normal text-center mb-16 tracking-tight text-[#1A1A1A] dark:text-white font-['Prosto_One']">
                    Our Collections
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-16 gap-x-8">
                    {collections.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className="w-full aspect-square overflow-hidden mb-6 group">
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 contrast-[1.05] brightness-[1.02]"
                                />
                            </div>
                            <h3 className="text-[12px] font-bold tracking-[0.2em] text-[#1A1A1A] dark:text-white uppercase">
                                {item.name}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Collections;
