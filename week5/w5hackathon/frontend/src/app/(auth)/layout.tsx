"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import PageHero from "@/components/common/page-hero";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLogin = pathname.includes("/login");
    const mode = isLogin ? "login" : "register";

    return (
        <div className="bg-white min-h-screen pb-8">
            <PageHero
                title={isLogin ? "Login" : "Register"}
                subtitle="Lorem ipsum dolor sit amet consectetur. At in pretium semper vitae eu eu mus."
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: isLogin ? "Login" : "Register" },
                ]}
            />

            <section className="flex flex-col items-center gap-10 mt-10  px-5 relative z-20">
                {/* Animated Toggle */}
                <div className="relative flex w-[280px] h-[58px] bg-white border border-[#2e3d83] rounded-full p-1 shadow-sm overflow-hidden">
                    {/* Sliding Pill */}
                    <div
                        className="absolute h-[46px] w-[calc(50%-4px)] bg-[#2e3d83] rounded-full transition-all duration-300 ease-in-out"
                        style={{
                            transform: `translateX(${mode === "login" ? "100%" : "0"})`,
                        }}
                    />

                    <Link
                        href="/register"
                        className={`relative z-10 flex-1 flex items-center justify-center text-[20px] font-semibold transition-colors duration-300 ${mode === "register" ? "text-white" : "text-[#2e3d83]"}`}
                    >
                        Register
                    </Link>
                    <Link
                        href="/login"
                        className={`relative z-10 flex-1 flex items-center justify-center text-[20px] font-semibold transition-colors duration-300 ${mode === "login" ? "text-white" : "text-[#2e3d83]"}`}
                    >
                        Login
                    </Link>
                </div>

                {/* Page Content (Form) */}
                <div className="w-full flex justify-center">
                    {children}
                </div>
            </section>
        </div>
    );
}
