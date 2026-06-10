import type { Metadata } from "next";
import { Montserrat, Work_Sans, Poppins } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"]
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["900"],
  style: ["italic"]
});

export const metadata: Metadata = {
  title: "yourSNEAKER | E-commerce",
  description: "Your best sneakers e-commerce",
};

import { StoreProvider } from "../store/provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${workSans.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-montserrat m-0 p-0 overflow-x-hidden bg-white text-black">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
