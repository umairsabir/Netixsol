import { NextResponse } from 'next/server';

export async function GET() {
  const heroSectionData = [
    {
      id: 1,
      image: "/sideImage (1).png",
      description: "God Of War 4",
    },
    {
      id: 2,
      image: "/sideImage (2).png",
      description: "Farcry 6 Golden Edition",
    },
    {
      id: 3,
      image: "/sideImage (3).png",
      description: "GTA V",
    },
    {
      id: 4,
      image: "/sideImage (4).png",
      description: "Outlast 2",
    }
  ];

  return NextResponse.json(heroSectionData);
}
