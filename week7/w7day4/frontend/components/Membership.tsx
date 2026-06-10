'use client';

import { Box, Typography, Container, Button } from "@mui/material";

export default function Membership() {
  return (
    <Box sx={{ width: '100%', py: 10 }}>
      <Container maxWidth="xl">
        <Typography 
          sx={{ 
            fontFamily: "var(--font-montserrat)", 
            fontWeight: 700, 
            fontSize: "40px",
            mb: 4,
            textTransform: "uppercase",
            color: "#000"
          }}
        >
          MORE NIKE PRODUCTS
        </Typography>

        <Box 
          sx={{ 
            width: "100%", 
            height: "324px", 
            backgroundImage: "url('/membership-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            borderRadius: "0px",
            overflow: "hidden",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: { xs: 4, md: 8 }
          }}
        >
          {/* Content */}
          <Box sx={{ zIndex: 2, maxWidth: "500px" }}>
            <Typography 
              sx={{ 
                fontFamily: "var(--font-montserrat)", 
                fontWeight: 900, 
                fontStyle: "italic",
                fontSize: "40px",
                color: "#FFFFFF",
                textTransform: "uppercase",
                mb: 1,
                lineHeight: 1.2
              }}
            >
              YOUR NIKE<br/>MEMBERSHIP
            </Typography>
            <Typography 
              sx={{ 
                fontFamily: "var(--font-montserrat)", 
                fontWeight: 400, 
                fontSize: "20px",
                color: "#FFFFFF",
                mb: 4
              }}
            >
              Join our members and show your love with Nike By You!
            </Typography>
            <Button 
              variant="contained" 
              sx={{ 
                backgroundColor: "#FFFFFF", 
                color: "#000000", 
                borderRadius: "16px",
                textTransform: "none",
                fontFamily: "var(--font-montserrat)",
                fontWeight: 400,
                fontSize: "16px",
                px: 5,
                py: 1,
                '&:hover': {
                  backgroundColor: "#F0F0F0"
                }
              }}
            >
              Join Us
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
