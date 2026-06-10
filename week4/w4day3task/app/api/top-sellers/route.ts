import { NextResponse } from 'next/server';

export async function GET() {
  const topSellers = [
    {
      id: 1,
      name: "Ghostbusters: Spirits Unleashed",
      image: "/topSellers (1).png",
      price: 939
    },
    {
      id: 2,
      name: "GTA V : Premier edition",
      image: "/topSellers (2).png",
      price: 2499
    },
    {
      id: 3,
      name: "Days Gone",
      image: "/topSellers (3).png",
      price: 2699
    },
    {
      id: 4,
      name: "The Last of Us",
      image: "/topSellers (4).png",
      price: 1499
    },
    {
      id: 5,
      name: "God of War 4",
      image: "/topSellers (5).png",
      price: 2659
    }
  ];

  return NextResponse.json(topSellers);
}
