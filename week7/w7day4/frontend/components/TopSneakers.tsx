'use client';

import { Box, Typography, Container, IconButton, Snackbar, Alert } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useGetProductsQuery, useAddToCartMutation } from '../services/api';
import { useState, useEffect } from "react";


interface TopSneakersProps {
  category?: string;
}

export default function TopSneakers({ category = 'ALL' }: TopSneakersProps) {
  const { data: products = [], isLoading } = useGetProductsQuery(category);
  const [addToCart] = useAddToCartMutation();
  const [snackOpen, setSnackOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sessionId = "default-session";

  // When category changes, reset the scroll index
  useEffect(() => {
    setCurrentIndex(0);
  }, [category]);

  const displayProducts = products;
  const visibleProducts = displayProducts.slice(currentIndex, currentIndex + 3);



  const handleAddToCart = async (item: any) => {
    const productData = {
      productId: item.id,
      name: item.name,
      price: parseFloat(item.price || "20.99"),
      image: item.image?.url || "",
      quantity: 1
    };

    await addToCart({ sessionId, item: productData });
    setSnackOpen(true);
  };

  const handlePrev = () => setCurrentIndex(Math.max(0, currentIndex - 1));
  const handleNext = () => setCurrentIndex(Math.min(displayProducts.length - (displayProducts.length > 3 ? 3 : 0), currentIndex + 1));

  return (
    <Box sx={{ width: '100%', py: 10 }}>
      {/* Summertime Mood Header */}
      <Box sx={{ textAlign: "center", mb: 10 }}>
        <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 400, fontSize: "40px", color: "#000" }}>
          At the moment
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 900, fontStyle: "italic", fontSize: { xs: "50px", md: "80px" }, textTransform: "uppercase", lineHeight: 1.2 }}>
          SUMMERTIME MOOD
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 400, fontSize: "40px", color: "#000" }}>
          Fight the heat in a sunny look!
        </Typography>
      </Box>

      <Container maxWidth="xl">
        {/* Navigation and Title */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 6 }}>
          <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "40px", color: "#000" }}>
            {category === 'ALL' ? 'Top sneakers' : `${category.charAt(0) + category.slice(1).toLowerCase()}'s Sneakers`}
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <IconButton
              onClick={handlePrev}
              disabled={currentIndex === 0}
              sx={{ 
                width: 55, height: 55,
                backgroundColor: "#F5F5F5", 
                color: "#000",
                '&:hover': { backgroundColor: "#DDD" } 
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              disabled={displayProducts.length <= 3 || currentIndex >= displayProducts.length - 3}
              sx={{ 
                width: 55, height: 55,
                backgroundColor: "#C6C6C6", 
                color: "#000",
                '&:hover': { backgroundColor: "#AAA" } 
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        </Box>



        {/* Product Cards Grid */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, minHeight: '400px', justifyContent: 'center', alignItems: 'center' }}>
          {isLoading ? (
            <Typography>Loading sneakers...</Typography>
          ) : visibleProducts.length > 0 ? (
            visibleProducts.map((item: any, index: number) => (

            <Box 
              key={item.id || index} 
              sx={{ 
                flex: 1, 
                backgroundColor: "#EFEFEF", 
                borderRadius: "18px", 
                height: "500px", // Reduced height
                position: "relative",
                overflow: "hidden",
                boxShadow: "5px 5px 25px rgba(0, 0, 0, 0.1)",
                display: 'flex',
                flexDirection: 'column',
                p: 4,
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >


              {/* Shoe Image Container */}
              <Box 
                sx={{ 
                  height: "300px", // Fixed height for image area
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  mb: 2,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box 
                  component="img"
                  src={item.image?.url || "/nike-air-max.png"}
                  alt={item.name}
                  sx={{ 
                    maxHeight: "100%", 
                    maxWidth: "100%", 
                    objectFit: "contain",
                    filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.15))",
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: "scale(1.05)" }
                  }}
                />
              </Box>

              {/* Content */}
              <Box sx={{ mt: 'auto' }}>
                <Typography sx={{ fontFamily: "var(--font-work-sans)", fontWeight: 700, fontSize: { xs: "24px", md: "32px" }, color: "#000", mb: 1, lineHeight: 1.2 }}>
                  {item.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontFamily: "var(--font-work-sans)", fontWeight: 400, fontSize: "20px", color: "#000" }}>
                    ${parseFloat(item.price || "20.99").toFixed(2)}
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                    sx={{ 
                      width: 50, height: 50,
                      backgroundColor: "#000", 
                      color: "#FFF", 
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      '&:hover': { backgroundColor: "#333", transform: 'scale(1.1)' } 
                    }}
                  >
                    <AddShoppingCartIcon />
                  </IconButton>
                </Box>
              </Box>


            </Box>
          ))
          ) : (
            <Typography>No products found in this category.</Typography>
          )}
        </Box>

      </Container>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" sx={{ fontFamily: "var(--font-montserrat)" }}>Added to cart!</Alert>
      </Snackbar>
    </Box>
  );
}
