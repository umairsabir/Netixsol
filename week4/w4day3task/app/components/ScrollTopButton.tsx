'use client';

import Image from "next/image";

export default function ScrollTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className="w-8 h-8 cursor-pointer flex items-center justify-center transition rounded"
    >
      <Image src={"/move-to-up.png"} alt="move" width={32} height={32} />
    </button>
  );
}
