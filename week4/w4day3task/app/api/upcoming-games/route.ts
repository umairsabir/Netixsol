import { NextResponse } from 'next/server';

export async function GET() {
  const topUpcomingGames = [
    {
      id: 1,
      name: "Hogwarts Legacy",
      image: "/topUpcoming (1).png",
      price: 2999
    },
    {
      id: 2,
      name: "Uncharted Legacy of Thieves",
      image: "/topUpcoming (2).png",
      price: 4499
    },
    {
      id: 3,
      name: "Assassin's Creed Mirage",
      image: "/topUpcoming (3).png",
      price: 3499
    },
    {
      id: 4,
      name: "The Last of Us II",
      image: "/topUpcoming (4).png",
      price: 3999
    },
    {
      id: 5,
      name: "Dead by Daylight",
      image: "/topUpcoming (5).png",
      price: "Coming Soon"
    }
  ];

  return NextResponse.json(topUpcomingGames);
}
