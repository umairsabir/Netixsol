import { Box, Typography, Container, Button } from "@mui/material";

export default function DiscountPromotion() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
        {/* Card 1 */}
        <Box sx={{ flex: 1 }}>
          <Box 
            sx={{ 
              backgroundColor: "#EFEFEF", 
              borderRadius: "18px", 
              boxShadow: "5px 5px 25px rgba(0, 0, 0, 0.25)",
              p: { xs: 3, md: 5 },
              position: "relative",
              minHeight: { xs: "250px", md: "300px" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              overflow: "hidden"
            }}
          >
            <Box sx={{ zIndex: 2 }}>
              <Typography sx={{ color: "#FF3939", fontWeight: 700, fontFamily: "var(--font-montserrat)", fontSize: { xs: "24px", md: "30px" }, display: "inline-block", mr: 1 }}>
                -20%
              </Typography>
              <Typography sx={{ color: "#FF3939", fontWeight: 700, fontFamily: "var(--font-montserrat)", fontSize: { xs: "20px", md: "24px" }, display: "inline-block" }}>
                Discount
              </Typography>
              <Typography sx={{ color: "#202727", fontWeight: 400, fontFamily: "var(--font-montserrat)", fontSize: { xs: "16px", md: "20px" }, mt: 1, mb: 3 }}>
                on your first purchase
              </Typography>
              <Button 
                variant="contained" 
                sx={{ 
                  backgroundColor: "#000000", 
                  color: "#FFFFFF", 
                  borderRadius: "16px", 
                  textTransform: "none",
                  fontFamily: "var(--font-montserrat)",
                  fontWeight: 400,
                  fontSize: { xs: "16px", md: "20px" },
                  px: 4,
                  py: 1.5,
                  '&:hover': { backgroundColor: "#333333" }
                }}
              >
                Shop now
              </Button>
            </Box>
            {/* Placeholder for the shoe image floating on the right */}
            <Box 
              sx={{
                position: "absolute",
                right: "-10%",
                top: "10%",
                width: { xs: "200px", md: "300px" },
                height: { xs: "200px", md: "300px" },
                backgroundColor: "#D9D9D9", // Using a placeholder block to mimic the design
                transform: "rotate(-30deg)",
                filter: "drop-shadow(0px 15px 30px rgba(0, 0, 0, 0.25))",
                zIndex: 1,
                borderRadius: "20px",
                opacity: 0.1
              }}
            />
          </Box>
        </Box>

        {/* Card 2 */}
        <Box sx={{ flex: 1 }}>
          <Box 
            sx={{ 
              backgroundColor: "#EFEFEF", 
              borderRadius: "18px", 
              boxShadow: "5px 5px 25px rgba(0, 0, 0, 0.25)",
              p: { xs: 3, md: 5 },
              position: "relative",
              minHeight: { xs: "250px", md: "300px" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              overflow: "hidden"
            }}
          >
             {/* Small Green background shape placeholder inside right card matching design */}
             <Box sx={{ position: "absolute", right: "-10%", top: 0, width: "200px", height: "100px", transform: "rotate(45deg)", background: "rgba(0,128,0,0.1)" }} />
            <Box sx={{ zIndex: 2 }}>
               <Typography sx={{ color: "#FF3939", fontWeight: 700, fontFamily: "var(--font-montserrat)", fontSize: { xs: "24px", md: "30px" }, display: "inline-block", mr: 1 }}>
                -20%
              </Typography>
              <Typography sx={{ color: "#FF3939", fontWeight: 700, fontFamily: "var(--font-montserrat)", fontSize: { xs: "20px", md: "24px" }, display: "inline-block" }}>
                Discount
              </Typography>
              <Typography sx={{ color: "#202727", fontWeight: 400, fontFamily: "var(--font-montserrat)", fontSize: { xs: "16px", md: "20px" }, mt: 1 }}>
                on your first purchase
              </Typography>
            </Box>
            {/* Placeholder shoe diff design */}
            <Box 
              sx={{
                position: "absolute",
                right: "-10%",
                top: "10%",
                width: { xs: "200px", md: "300px" },
                height: { xs: "200px", md: "300px" },
                backgroundColor: "#D9D9D9",
                transform: "rotate(30deg)",
                filter: "drop-shadow(0px 15px 30px rgba(0, 0, 0, 0.3))",
                zIndex: 1,
                borderRadius: "20px",
                opacity: 0.1
              }}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
