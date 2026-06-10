'use client';

import { Box } from "@mui/material";
import Navbar from "../../../components/Navbar";
import TopSneakers from "../../../components/TopSneakers";
import Footer from "../../../components/Footer";
import { useParams } from "next/navigation";

export default function CategoryPage() {
  const params = useParams();
  const category = (params.slug as string)?.toUpperCase() || 'ALL';

  return (
    <Box sx={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      <Navbar />
      <TopSneakers category={category} />
      <Footer />
    </Box>
  );
}
