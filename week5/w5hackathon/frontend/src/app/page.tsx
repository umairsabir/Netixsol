import Hero from "@/components/home/hero";
import LiveAuction from "@/components/home/live-auction";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Hero />
      <LiveAuction />
      {/* Add more sections here later */}
    </main>
  );
}
