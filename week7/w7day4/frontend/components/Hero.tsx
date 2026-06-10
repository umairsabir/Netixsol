'use client';

import { Box, Typography, Button, Container } from "@mui/material";

export default function Hero() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#111111", // Fallback color
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", lg: "1400px" },
          height: { xs: "auto", md: "300px" },
          position: "relative",
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          px: { xs: 3, md: 8 },
          py: { xs: 6, md: 20 },
          my: 2,
          overflow: "hidden"
        }}
      >
        <Box sx={{ maxWidth: { xs: "100%", md: "500px" }, zIndex: 1 }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 900,
              fontSize: { xs: "32px", md: "48px" },
              lineHeight: 1.1,
              textTransform: "uppercase",
              fontStyle: "italic",
              mb: 3,
              color: "#FFF",
              letterSpacing: "-1px"
            }}
          >
            WE ARE NEVER DONE
          </Typography>

          <Typography
            sx={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 600,
              fontSize: { xs: "14px", md: "16px" },
              lineHeight: 1.5,
              mb: 4,
              color: "#FFF",
              maxWidth: "420px"
            }}
          >
            Celebrating 50 years of Nike from May 16th!
            Exclusive products, experiences and much more
            await you for five days. Scan and join the Nike app!
          </Typography>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#FFF",
              color: "#000",
              px: 4,
              py: 1.5,
              borderRadius: "30px",
              fontWeight: 700,
              textTransform: "none",
              fontFamily: "var(--font-montserrat)",
              fontSize: "15px",
              '&:hover': { backgroundColor: "#F0F0F0" }
            }}
          >
            Celebrate with us
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
