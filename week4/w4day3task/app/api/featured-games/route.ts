import { NextResponse } from 'next/server';

export async function GET() {
  const featuredGames = [
    {
      id: 1,
      name: "NFS UNBOUND",
      image: "/featured (1).png",
      description: "Pre-purchase NFS Unbound and get an exclusive Driving Effect, License Plate, $150,000 Bank, and more.",
      price: 3499
    },
    {
      id: 2,
      name: "FIFA 23",
      image: "/featured (2).png",
      description: "FIFA 23 brings The World's Game to the pitch, with HyperMotion2 Technology, men's and women's FIFA World Cup",
      price: 3699
    },
    {
      id: 3,
      name: "UNCHARTED 4",
      image: "/featured (3).png",
      description: "Get the definitive Uncharted 4 experience with all Season Pass content, the Ultimate Pack, and upcoming expansion.",
      price: 2199
    }
  ];

  return NextResponse.json(featuredGames);
}
