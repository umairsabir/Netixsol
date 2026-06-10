export default function ExploreCatalog() {
  return (
    <section className="py-16">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Image */}
        <div className="w-full h-[250px] md:h-[343px] rounded-xl overflow-hidden">
          <img
            src="/catalogue.png"
            alt="Explore Catalog"
            className=" object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="flex flex-col gap-4">
          <h2 className="text-white text-2xl md:text-3xl font-medium">
            Explore our Catalog
          </h2>

          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Browse by genre, features, price, and more to find your next favorite game.
          </p>

          <button className="w-fit mt-2 px-6 py-2 border border-white text-white rounded hover:bg-white hover:text-black transition">
            Browse Now
          </button>
        </div>

      </div>
    </section>
  );
}