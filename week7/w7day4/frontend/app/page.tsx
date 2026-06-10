"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturedSection from "../components/FeaturedSection";
import TopSneakers from "../components/TopSneakers";
import Categories from "../components/Categories";
import PromoBanner from "../components/PromoBanner";
import Membership from "../components/Membership";
import Footer from "../components/Footer";
import { Box, ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Create a custom MUI theme matching the design
const theme = createTheme({
  typography: {
    fontFamily: "var(--font-montserrat), sans-serif",
  },
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#FF3939",
    },
    background: {
      default: "#FFFFFF",
    },
  },
});

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: "100%", overflowX: "hidden" }}>
        <Navbar />
        <Hero />
        <FeaturedSection />
        <TopSneakers />
        <Categories />
        <PromoBanner />
        <Membership />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
