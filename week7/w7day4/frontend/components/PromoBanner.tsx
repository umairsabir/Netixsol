'use client';

import { Box, Typography, Container, Button } from "@mui/material";

export default function PromoBanner() {
  const promos = [
    {
      discount: "-20%",
      image: "/promo-shoe-grey.png",
      rotate: "-30.09deg",
      reverse: false
    },
    {
      discount: "-20%",
      image: "/promo-shoe-green.png",
      rotate: "-30deg",
      reverse: true
    }
  ];

  return (
    <Box sx={{ width: '100%', py: 10, backgroundColor: '#FFF' }}>
      <Container maxWidth="xl">
        <Typography 
          sx={{ 
            fontFamily: "var(--font-montserrat)", 
            fontWeight: 900, 
            fontStyle: "italic",
            fontSize: "40px",
            textAlign: "center",
            mb: 10,
            textTransform: "uppercase",
            color: "#000"
          }}
        >
          LOOKS GOOD. RUNS GOOD. FEELS GOOD.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 6 }}>
          {promos.map((promo, idx) => (
            <Box 
              key={idx}
              sx={{ 
                flex: 1, 
                backgroundColor: "#EFEFEF", 
                borderRadius: "18px", 
                boxShadow: "5px 5px 25px rgba(0, 0, 0, 0.2)",
                p: { xs: 4, md: 6 },
                position: "relative",
                minHeight: "350px",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflow: 'visible' // Allow shoe to pop out
              }}
            >
              {/* Discount Badge */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ color: '#FF3939', fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: "30px", mr: 1 }}>
                  {promo.discount}
                </Typography>
                <Typography sx={{ color: '#FF3939', fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: "24px" }}>
                  Discount
                </Typography>
              </Box>

              <Typography sx={{ color: '#202727', fontFamily: 'var(--font-montserrat)', fontWeight: 400, fontSize: "20px", mb: 4 }}>
                on your first purchase
              </Typography>

              <Button 
                variant="contained"
                sx={{ 
                  width: '180px',
                  height: '54px',
                  backgroundColor: '#000',
                  color: '#FFF',
                  borderRadius: '16px',
                  textTransform: 'none',
                  fontSize: '20px',
                  fontFamily: 'var(--font-montserrat)',
                  fontWeight: 400,
                  '&:hover': { backgroundColor: '#333' }
                }}
              >
                Shop now
              </Button>

              {/* Promo Shoe Image */}
              <Box 
                component="img"
                src={promo.image}
                sx={{ 
                  position: "absolute",
                  width: { xs: '200px', md: '360px' },
                  right: { xs: '0', md: '-40px' },
                  top: { xs: '-50px', md: '-40px' },
                  transform: `rotate(${promo.rotate})`,
                  filter: "drop-shadow(0px 15px 30px rgba(0,0,0,0.25))",
                  zIndex: 2,
                  pointerEvents: 'none'
                }}
              />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
