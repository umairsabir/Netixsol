import Image from "next/image";
import Navbar from "./components/Navbar";
import Searchbar from "./components/Search";
import HeroSection from "./components/HeroSection";
import GamesOnSale from "./components/GameOnSale";
import FeaturedGames from "./components/FeaturedGames";
import FreeGames from "./components/FreeGames";
import TopGames from "./components/TopGames";
import ExploreCatalog from "./components/Catalogue";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="bg-black w-full lg:max-w-[1440px] mx-auto min-h-screen font-poppins">
      <Navbar />
        <div className="w-full px-4 md:px-6 lg:px-0 lg:max-w-[1077px] lg:mx-auto">
          <Searchbar/>
          <HeroSection/>
          <GamesOnSale title="Game on sale"/>
          <FeaturedGames/>
          <FreeGames/>
          <TopGames/>
          <FeaturedGames/>
          <GamesOnSale title="Game with Achivements"/>
          <ExploreCatalog/>
        </div>
        <Footer/>
    </div>
  );
}
