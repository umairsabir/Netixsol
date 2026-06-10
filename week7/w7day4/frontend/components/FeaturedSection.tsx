'use client';

import { Box, Typography } from "@mui/material";

export default function FeaturedSection() {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#FFF', position: 'relative', overflow: 'hidden' }}>

      {/* Top Bar - Just Do It Image */}
      <Box
        sx={{
          width: '100%',
          height: '49px',
          backgroundImage: "url('/just-do-it-bar.png')",
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat-x',
          zIndex: 10,
          backgroundColor: '#FFF'
        }}
      />

      {/* Main Full-Width Container */}
      <Box
        sx={{
          width: '100vw',
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Full-Width Background Image Area */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            minHeight: '100vh',
            position: 'absolute',
            top: '0px',
            left: 0,
            backgroundImage: "url('/second-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 1
          }}
        >
          {/* Blur Overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(196, 196, 196, 0.1)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}
          >
            {/* Center Nike Tick */}
            <Box
              component="img"
              src="/nike.png"
              sx={{
                width: { xs: '250px', md: '450px' },
                opacity: 0.95,
                filter: 'brightness(0) invert(1)',
                dropShadow: '0 15px 40px rgba(0,0,0,0.4)'
              }}
            />
          </Box>


        </Box>

        {/* Product Cards Container - Overlaying the full screen section */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '1400px', // Content still centered
            margin: '0 auto',
            position: 'relative',
            zIndex: 5,
            pt: { xs: '60vh', md: '50vh' }, // Push cards down to reveal background/tick
            pb: 10,
            px: 4,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'center',
            gap: 6
          }}
        >
          {/* Card 1: Air Jordan 1 Mid */}
          <Box
            sx={{
              width: { xs: '100%', md: '602px' },
              height: '272px',
              backgroundColor: '#EFEFEF',
              borderRadius: '18px',
              boxShadow: '0 15px 45px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              p: 4,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { transform: 'scale(1.03) translateY(-8px)', boxShadow: '0 25px 65px rgba(0, 0, 0, 0.35)' }
            }}
          >
            <Typography sx={{ color: '#FF3939', fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontStyle: 'italic', fontSize: { xs: '40px', md: '48px' }, lineHeight: 1 }}>
              NEW
            </Typography>
            <Typography sx={{ color: '#000', fontFamily: 'var(--font-montserrat)', fontWeight: 400, fontSize: '20px', mt: 1, maxWidth: '220px' }}>
              AIR JORDAN 1 MID LIGHT SMOKE GREY
            </Typography>

            <Box
              component="img"
              src="/nike-air-max.png"
              sx={{
                position: 'absolute',
                width: { xs: '300px', md: '480px' },
                right: { xs: '-20px', md: '-60px' },
                bottom: { xs: '10px', md: '20px' },
                transform: 'rotate(-28.75deg)',
                filter: 'drop-shadow(0px 30px 60px rgba(0, 0, 0, 0.45))'
              }}
            />

            <Box sx={{ position: 'absolute', bottom: 30, left: 40, width: '40px', height: '40px', backgroundColor: '#FFF', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
          </Box>

          {/* Card 2: Air Max 200 SE */}
          <Box
            sx={{
              width: { xs: '100%', md: '612px' },
              height: '272px',
              backgroundColor: '#EFEFEF',
              borderRadius: '18px',
              boxShadow: '0 15px 45px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              p: 4,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { transform: 'scale(1.03) translateY(-8px)', boxShadow: '0 25px 65px rgba(0, 0, 0, 0.35)' }
            }}
          >
            <Typography sx={{ color: '#FF3939', fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontStyle: 'italic', fontSize: { xs: '40px', md: '48px' }, lineHeight: 1 }}>
              NEW
            </Typography>
            <Typography sx={{ color: '#000', fontFamily: 'var(--font-montserrat)', fontWeight: 400, fontSize: '20px', mt: 1 }}>
              Air Max 200 SE
            </Typography>

            <Box
              component="img"
              src="/nike-air-max-red.png"
              sx={{
                position: 'absolute',
                width: { xs: '270px', md: '420px' },
                right: '0px',
                bottom: '40px',
                transform: 'rotate(-30deg)',
                filter: 'drop-shadow(0px 30px 60px rgba(0, 0, 0, 0.45))'
              }}
            />

            <Box sx={{ position: 'absolute', bottom: 30, left: 40, width: '40px', height: '40px', backgroundColor: '#FFF', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
