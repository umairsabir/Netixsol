import { NextResponse } from 'next/server';

export async function GET() {
  const freeGames = [
    {
      id: 1,
      name: "Darkwood",
      image: "/free game (1).png",
      status: "FREE NOW",
      date: "Jul 25",
    },
    {
      id: 2,
      name: "Assassin's Creed Black Flag",
      image: "/free game (2).png",
      status: "FREE NOW",
      date: "Jul 25",
    },
    {
      id: 3,
      name: "NFS : Shift",
      image: "/free game (3).png",
      status: "FREE",
      date: "Jul 27 - Aug 5",
    },
    {
      id: 4,
      name: "Warface",
      image: "/free game (4).png",
      status: "FREE",
      date: "Jul 27 - Aug 5",
    }
  ];

  return NextResponse.json(freeGames);
}
