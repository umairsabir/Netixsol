import { NextResponse } from 'next/server';

export async function GET() {
  const gamesOnSale = [
    {
      id: 1,
      name: "Valorant",
      image: "/onSale (1).png",
      discount: "-10%",
      originalPrice: 900,
      discountedPrice: 850
    },
    {
      id: 2,
      name: "Assassin's Creed Valhalla",
      image: "/onSale (2).png",
      discount: "-20%",
      originalPrice: 3499,
      discountedPrice: 2999
    },
    {
      id: 3,
      name: "Red Dead Redemption 2",
      image: "/onSale (3).png",
      discount: "-50%",
      originalPrice: 3199,
      discountedPrice: 1599
    },
    {
      id: 4,
      name: "Shadow of the Tomb Raider",
      image: "/onSale (4).png",
      discount: "-20%",
      originalPrice: 2195,
      discountedPrice: 2000
    },
    {
      id: 5,
      name: "Cyberpunk 2077",
      image: "/onSale (5).png",
      discount: "-50%",
      originalPrice: 4000,
      discountedPrice: 2000
    },
    {
      id: 6,
      name: "Valorant",
      image: "/onSale (1).png",
      discount: "-10%",
      originalPrice: 900,
      discountedPrice: 850
    },
    {
      id: 7,
      name: "Assassin's Creed Valhalla",
      image: "/onSale (2).png",
      discount: "-20%",
      originalPrice: 3499,
      discountedPrice: 2999
    },
    {
      id: 8,
      name: "Red Dead Redemption 2",
      image: "/onSale (3).png",
      discount: "-50%",
      originalPrice: 3199,
      discountedPrice: 1599
    },
    {
      id: 9,
      name: "Shadow of the Tomb Raider",
      image: "/onSale (4).png",
      discount: "-20%",
      originalPrice: 2195,
      discountedPrice: 2000
    },
    {
      id: 10,
      name: "Cyberpunk 2077",
      image: "/onSale (5).png",
      discount: "-50%",
      originalPrice: 4000,
      discountedPrice: 2000
    }
  ];

  return NextResponse.json(gamesOnSale);
}
