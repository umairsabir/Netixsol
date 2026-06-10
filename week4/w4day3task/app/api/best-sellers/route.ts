import { NextResponse } from 'next/server';

export async function GET() {
  const bestSellers = [
    {
      id: 1,
      name: "Fortnite",
      image: "/bestSeller (1).png",
      price: "Free"
    },
    {
      id: 2,
      name: "GTA V : Premier edition",
      image: "/bestSeller (2).png",
      price: 2499
    },
    {
      id: 3,
      name: "IGI 2",
      image: "/bestSeller (3).png",
      price: 499
    },
    {
      id: 4,
      name: "Tomb Raider",
      image: "/bestSeller (4).png",
      price: 2499
    },
    {
      id: 5,
      name: "Uncharted 4",
      image: "/bestSeller (5).png",
      price: 3499
    }
  ];

  return NextResponse.json(bestSellers);
}
