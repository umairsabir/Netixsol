import { create } from 'zustand';
import { fetchHeroSectionData, fetchResourceLinks, fetchGamesOnSale, fetchFeaturedGames, fetchFreeGames, fetchTopSellers, fetchBestSellers, fetchTopUpcomingGames } from '@/app/actions/gameActions';

export interface Game {
  id: number;
  name: string;
  image: string;
  discount?: string;
  originalPrice?: number;
  discountedPrice?: number;
  rating?: number;
  description?: string;
  price?: number | string;
  releaseDate?: string;
  status?: string;
  date?: string;
}

export interface ResourceLink {
  category: string;
  links: string[];
}

interface GamesStore {
  // Games data
  heroSlider: Game[];
  resourceLinks: ResourceLink[];
  gamesOnSale: Game[];
  featuredGames: Game[];
  freeGames: Game[];
  topSellers: Game[];
  bestSellers: Game[];
  upcomingGames: Game[];

  // Loading states
  loadingHeroSlider: boolean;
  loadingResourceLinks: boolean;
  loadingGamesOnSale: boolean;
  loadingFeaturedGames: boolean;
  loadingFreeGames: boolean;
  loadingTopSellers: boolean;
  loadingBestSellers: boolean;
  loadingUpcomingGames: boolean;

  // Error states
  errorHeroSlider: string | null;
  errorResourceLinks: string | null;
  errorGamesOnSale: string | null;
  errorFeaturedGames: string | null;
  errorFreeGames: string | null;
  errorTopSellers: string | null;
  errorBestSellers: string | null;
  errorUpcomingGames: string | null;

  // Fetch actions
  fetchHeroSliderData: () => Promise<void>;
  fetchResourceLinksData: () => Promise<void>;
  fetchGamesOnSaleData: () => Promise<void>;
  fetchFeaturedGamesData: () => Promise<void>;
  fetchFreeGamesData: () => Promise<void>;
  fetchTopSellersData: () => Promise<void>;
  fetchBestSellersData: () => Promise<void>;
  fetchUpcomingGamesData: () => Promise<void>;

  // Reset actions
  resetGamesOnSale: () => void;
}

export const useGamesStore = create<GamesStore>((set) => ({
  // Initial state
  heroSlider: [],
  resourceLinks: [],
  gamesOnSale: [],
  featuredGames: [],
  freeGames: [],
  topSellers: [],
  bestSellers: [],
  upcomingGames: [],

  loadingHeroSlider: false,
  loadingResourceLinks: false,
  loadingGamesOnSale: false,
  loadingFeaturedGames: false,
  loadingFreeGames: false,
  loadingTopSellers: false,
  loadingBestSellers: false,
  loadingUpcomingGames: false,

  errorHeroSlider: null,
  errorResourceLinks: null,
  errorGamesOnSale: null,
  errorFeaturedGames: null,
  errorFreeGames: null,
  errorTopSellers: null,
  errorBestSellers: null,
  errorUpcomingGames: null,

  // Fetch hero slider
  fetchHeroSliderData: async () => {
    set({ loadingHeroSlider: true, errorHeroSlider: null });
    try {
      const data = await fetchHeroSectionData();
      set({ heroSlider: data, loadingHeroSlider: false });
    } catch (error) {
      set({ 
        errorHeroSlider: error instanceof Error ? error.message : 'Failed to fetch hero slider',
        loadingHeroSlider: false 
      });
    }
  },

  // Fetch resource links
  fetchResourceLinksData: async () => {
    set({ loadingResourceLinks: true, errorResourceLinks: null });
    try {
      const data = await fetchResourceLinks();
      set({ resourceLinks: data, loadingResourceLinks: false });
    } catch (error) {
      set({ 
        errorResourceLinks: error instanceof Error ? error.message : 'Failed to fetch resource links',
        loadingResourceLinks: false 
      });
    }
  },
  fetchGamesOnSaleData: async () => {
    set({ loadingGamesOnSale: true, errorGamesOnSale: null });
    try {
      const data = await fetchGamesOnSale();
      set({ gamesOnSale: data, loadingGamesOnSale: false });
    } catch (error) {
      set({ 
        errorGamesOnSale: error instanceof Error ? error.message : 'Failed to fetch games on sale',
        loadingGamesOnSale: false 
      });
    }
  },

  // Fetch featured games
  fetchFeaturedGamesData: async () => {
    set({ loadingFeaturedGames: true, errorFeaturedGames: null });
    try {
      const data = await fetchFeaturedGames();
      set({ featuredGames: data, loadingFeaturedGames: false });
    } catch (error) {
      set({ 
        errorFeaturedGames: error instanceof Error ? error.message : 'Failed to fetch featured games',
        loadingFeaturedGames: false 
      });
    }
  },

  // Fetch free games
  fetchFreeGamesData: async () => {
    set({ loadingFreeGames: true, errorFreeGames: null });
    try {
      const data = await fetchFreeGames();
      set({ freeGames: data, loadingFreeGames: false });
    } catch (error) {
      set({ 
        errorFreeGames: error instanceof Error ? error.message : 'Failed to fetch free games',
        loadingFreeGames: false 
      });
    }
  },

  // Fetch top sellers
  fetchTopSellersData: async () => {
    set({ loadingTopSellers: true, errorTopSellers: null });
    try {
      const data = await fetchTopSellers();
      set({ topSellers: data, loadingTopSellers: false });
    } catch (error) {
      set({ 
        errorTopSellers: error instanceof Error ? error.message : 'Failed to fetch top sellers',
        loadingTopSellers: false 
      });
    }
  },

  // Fetch best sellers
  fetchBestSellersData: async () => {
    set({ loadingBestSellers: true, errorBestSellers: null });
    try {
      const data = await fetchBestSellers();
      set({ bestSellers: data, loadingBestSellers: false });
    } catch (error) {
      set({ 
        errorBestSellers: error instanceof Error ? error.message : 'Failed to fetch best sellers',
        loadingBestSellers: false 
      });
    }
  },

  // Fetch upcoming games
  fetchUpcomingGamesData: async () => {
    set({ loadingUpcomingGames: true, errorUpcomingGames: null });
    try {
      const data = await fetchTopUpcomingGames();
      set({ upcomingGames: data, loadingUpcomingGames: false });
    } catch (error) {
      set({ 
        errorUpcomingGames: error instanceof Error ? error.message : 'Failed to fetch upcoming games',
        loadingUpcomingGames: false 
      });
    }
  },

  // Reset games on sale
  resetGamesOnSale: () => {
    set({ 
      gamesOnSale: [], 
      loadingGamesOnSale: false, 
      errorGamesOnSale: null 
    });
  },
}));
