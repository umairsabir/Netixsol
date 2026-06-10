import type { Metadata } from "next";
import { Lato, Josefin_Sans } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/common/top-bar";
import Footer from "@/components/common/footer";
import Navbar from "@/components/common/nav-bar";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/context/socket-context";
import ReduxProvider from "@/providers/redux-provider";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-josefin",
});

export const metadata: Metadata = {
  title: "Car Deposit - Register",
  description: "Register for Car Deposit",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lato.variable} ${josefinSans.variable}`}>
      <body className={`${lato.variable} ${josefinSans.variable} antialiased font-lato`}>
        <ReduxProvider>
          <SocketProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <TopBar />
            <Navbar />
            {children}
            <Footer />
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}