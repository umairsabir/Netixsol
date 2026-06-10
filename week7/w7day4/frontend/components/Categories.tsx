'use client';

import { Box, Typography, Container } from "@mui/material";

export default function Categories() {
  const categories = [
    { 
      name: "WORKOUT", 
      image: "/cat-workout.png", 
      reverse: false 
    },
    { 
      name: "RUN", 
      image: "/cat-run.png", 
      reverse: true 
    },
    { 
      name: "FOOTBALL", 
      image: "/cat-football.png", 
      reverse: false 
    }
  ];

  return (
    <Box sx={{ width: "100%", py: 10 }}>
      <Container maxWidth="xl">
        <Typography 
          sx={{ 
            fontFamily: "var(--font-montserrat)", 
            fontWeight: 700, 
            fontSize: "40px",
            mb: 8,
            color: "#000"
          }}
        >
          Buy by category
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {categories.map((cat, index) => (
            <Box 
              key={cat.name}
              sx={{ 
                display: "flex", 
                flexDirection: { 
                  md: cat.reverse ? "row-reverse" : "row" 
                },
                height: { xs: "320px", md: "570px" },
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Image Container */}
              <Box 
                sx={{ 
                  flex: 1, 
                  height: "100%",
                  width: { xs: "100%", md: "auto" },
                  position: { xs: "absolute", md: "relative" },
                  top: 0,
                  left: 0,
                  zIndex: 1,
                  backgroundImage: `url('${cat.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat"
                }}
              />

              {/* Text Container */}
              <Box 
                sx={{ 
                  flex: 1, 
                  height: "100%",
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  backgroundColor: { xs: "transparent", md: "#FFF" },
                  p: 4,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <Typography 
                  sx={{ 
                    fontFamily: "var(--font-montserrat)", 
                    fontWeight: 900, 
                    fontStyle: "italic", 
                    fontSize: { xs: "48px", md: "36px" }, 
                    letterSpacing: { xs: "0.1em", md: "0.3em" }, 
                    color: { xs: "#FFF", md: "#000" },
                    textAlign: "center",
                    textTransform: "uppercase",
                    textShadow: { xs: "0px 4px 20px rgba(0,0,0,0.5)", md: "none" }
                  }}
                >
                  {cat.name}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
