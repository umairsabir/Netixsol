import React from "react";
import {
  Smartphone,
  Tablet,
  Tv,
  Laptop,
  Gamepad2,
  Headset,
} from "lucide-react";

const devices = [
  {
    name: "Smartphones",
    icon: <Smartphone className="text-primary" size={28} />,
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
  },
  {
    name: "Tablet",
    icon: <Tablet className="text-primary" size={28} />,
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
  },
  {
    name: "Smart TV",
    icon: <Tv className="text-primary" size={28} />,
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
  },
  {
    name: "Laptops",
    icon: <Laptop className="text-primary" size={28} />,
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
  },
  {
    name: "Gaming Consoles",
    icon: <Gamepad2 className="text-primary" size={28} />,
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
  },
  {
    name: "VR Headsets",
    icon: <Headset className="text-primary" size={28} />,
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
  },
];

const DevicesSection: React.FC = () => {
  return (
    <section className="w-full mt-[100px] md:mt-[150px]">
      <div className="w-full max-w-[1920px] mx-auto px-[15px] laptop:px-[80px] desktop:px-[162px]">
        {/* Header */}
        <div className="flex flex-col mb-10 md:mb-[80px]">
          <h2 className="text-[28px] md:text-[38px] font-bold text-text-p mb-3">
            We Provide you streaming experience across various devices.
          </h2>
          <p className="text-[14px] md:text-[18px] text-text-s font-normal max-w-[1000px]">
            With StreamVibe, you can enjoy your favorite movies and TV shows
            anytime, anywhere. Our platform is designed to be compatible with a
            wide range of devices, ensuring that you never miss a moment of
            entertainment.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-[30px]">
          {devices.map((device, idx) => (
            <div
              key={idx}
              className="bg-[linear-gradient(225deg,rgba(229,0,0,0.1)_0%,rgba(15,15,15,0)_100%)] border border-border-custom rounded-[12px] p-8 lg:p-12 flex flex-col hover:border-border-custom/80 transition-colors"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-bg-custom border border-border-custom rounded-[12px] flex items-center justify-center">
                  {device.icon}
                </div>
                <h3 className="text-[20px] md:text-[24px] font-semibold text-text-p">
                  {device.name}
                </h3>
              </div>
              <p className="text-[14px] md:text-[16px] text-text-s font-normal leading-[150%]">
                {device.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DevicesSection;
