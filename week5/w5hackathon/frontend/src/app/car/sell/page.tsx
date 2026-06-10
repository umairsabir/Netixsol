import PageHero from "@/components/common/page-hero";
import SellForm from "@/components/sell/sell-form";

export default function SellCarPage() {
    return (
        <main className="min-h-screen bg-white">
            <PageHero 
                title="Sell Your Car" 
                subtitle="Lorem ipsum dolor sit amet consectetur. At in pretium semper vitae eu eu mus."
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Sell Your Car" }
                ]}
            />

            {/* Main Form Content */}
            <div className="container mx-auto px-4 lg:px-[118px] py-10 relative mt-10">
                <SellForm />
            </div>
        </main>
    );
}
