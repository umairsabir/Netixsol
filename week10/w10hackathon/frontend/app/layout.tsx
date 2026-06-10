import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Assignment Checker",
  description: "Automated student assignment evaluation powered by Groq.",
  keywords: "ai, assignment checker, grading, groq",
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
