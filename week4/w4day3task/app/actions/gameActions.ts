'use server';

// Static mock data
const heroSectionData = [
  {
    id: 1,
    name: "God Of War 4",
    image: "/sideImage (1).png",
    description: "God Of War 4",
  },
  {
    id: 2,
    name: "Farcry 6 Golden Edition",
    image: "/sideImage (2).png",
    description: "Farcry 6 Golden Edition",
  },
  {
    id: 3,
    name: "GTA V",
    image: "/sideImage (3).png",
    description: "GTA V",
  },
  {
    id: 4,
    name: "Outlast 2",
    image: "/sideImage (4).png",
    description: "Outlast 2",
  }
];

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

const resourceLinks = [
  {
    category: 'Column 1',
    links: [
      'Creator Support',
      'Published On Epic',
      'Profession',
      'Company'
    ]
  },
  {
    category: 'Column 2',
    links: [
      'Fan Work Policy',
      'User Exp Service',
      'User Liscence'
    ]
  },
  {
    category: 'Column 3',
    links: [
      'Online Service',
      'Community',
      'Epic Newsroom'
    ]
  },
  {
    category: 'Column 4',
    links: [
      'Battle Breakers',
      'Fortnite',
      'Infinity Blade'
    ]
  },
  {
    category: 'Column 5',
    links: [
      'Robo Recall',
      'Shadow Complex',
      'Unreal Tournament'
    ]
  }
];

// Export functions returning static data directly
export async function fetchHeroSectionData() {
  return heroSectionData;
}

export async function fetchGamesOnSale() {
  return gamesOnSale;
}

export async function fetchFeaturedGames() {
  return featuredGames;
}

export async function fetchFreeGames() {
  return freeGames;
}

export async function fetchTopSellers() {
  return topSellers;
}

export async function fetchBestSellers() {
  return bestSellers;
}

export async function fetchTopUpcomingGames() {
  return topUpcomingGames;
}

export async function fetchResourceLinks() {
  return resourceLinks;
}
