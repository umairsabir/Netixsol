import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediStore — Smart Healthcare Products",
  description:
    "Browse and discover healthcare products with AI-powered recommendations. Shop vitamins, supplements, and wellness products tailored to your health needs.",
  keywords: "healthcare, supplements, vitamins, health products, AI recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-black text-white selection:bg-emerald-500/20 mx-auto w-full max-w-7xl selection:text-emerald-400">{children}</body>
    </html>
  );
}
