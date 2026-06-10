'use client';

import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useGetMeQuery } from '@/services/authApi';

// Inline SVG crypto trading illustration
function CryptoIllustration() {
  return (
    <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Mobile phone base */}
      <rect x="140" y="60" width="240" height="300" rx="24" fill="#0d0d2b" stroke="#BBFFFF" strokeWidth="2" />
      <rect x="152" y="78" width="216" height="264" rx="12" fill="#060618" />

      {/* Screen content: chart bars */}
      <rect x="168" y="240" width="20" height="80" rx="4" fill="#73FDAA" opacity="0.9" />
      <rect x="196" y="210" width="20" height="110" rx="4" fill="#73FDAA" opacity="0.7" />
      <rect x="224" y="230" width="20" height="90" rx="4" fill="#BBFFFF" opacity="0.6" />
      <rect x="252" y="190" width="20" height="130" rx="4" fill="#73FDAA" />
      <rect x="280" y="215" width="20" height="105" rx="4" fill="#BBFFFF" opacity="0.8" />
      <rect x="308" y="200" width="20" height="120" rx="4" fill="#73FDAA" opacity="0.9" />
      <rect x="336" y="180" width="20" height="140" rx="4" fill="#73FDAA" />

      {/* Price line */}
      <polyline points="168,240 188,220 214,235 240,200 266,210 292,195 318,182 344,160" stroke="#BBFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* BTC coin floating top-right */}
      <circle cx="400" cy="100" r="44" fill="#F7931A" />
      <circle cx="400" cy="100" r="36" fill="#F9A825" />
      <text x="400" y="108" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">₿</text>
      {/* Glow */}
      <circle cx="400" cy="100" r="52" fill="none" stroke="#F7931A" strokeWidth="1" opacity="0.4" />

      {/* ETH coin floating left */}
      <circle cx="110" cy="170" r="36" fill="#627EEA" />
      <polygon points="110,148 122,172 110,180 98,172" fill="white" opacity="0.9" />
      <polygon points="110,184 122,172 110,192 98,172" fill="white" opacity="0.6" />
      <circle cx="110" cy="170" r="44" fill="none" stroke="#627EEA" strokeWidth="1" opacity="0.4" />

      {/* NFT card top-center */}
      <rect x="188" y="90" width="70" height="60" rx="8" fill="#1a1a3a" stroke="#73FDAA" strokeWidth="1.5" />
      <rect x="195" y="97" width="56" height="35" rx="4" fill="#0d2a1a" />
      <text x="223" y="120" textAnchor="middle" fill="#73FDAA" fontSize="9" fontWeight="bold">NFT</text>
      <text x="223" y="140" textAnchor="middle" fill="white" fontSize="8">#1247</text>

      {/* BUY badge */}
      <rect x="310" y="90" width="50" height="26" rx="6" fill="#73FDAA" />
      <text x="335" y="108" textAnchor="middle" fill="#010010" fontSize="12" fontWeight="bold">BUY</text>

      {/* Stars */}
      <text x="370" y="60" fill="#FFD700" fontSize="14">★</text>
      <text x="390" y="48" fill="#FFD700" fontSize="10">★</text>
      <text x="350" y="52" fill="#FFD700" fontSize="8">★</text>

      {/* Glow blobs */}
      <ellipse cx="260" cy="210" rx="120" ry="80" fill="#73FDAA" opacity="0.04" />
      <ellipse cx="400" cy="100" rx="60" ry="60" fill="#F7931A" opacity="0.07" />

      {/* Connecting lines / network */}
      <line x1="110" y1="206" x2="162" y2="260" stroke="#73FDAA" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
      <line x1="400" y1="144" x2="350" y2="170" stroke="#BBFFFF" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
    </svg>
  );
}

export default function HeroSection() {
  const router = useRouter();
  const { data: user } = useGetMeQuery();

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 14, md: 20 },
        pb: { xs: 8, md: 12 },
        minHeight: { xs: 'auto', md: '540px' },
      }}
    >
      {/* Green glow blob — top right */}
      <Box sx={{
        position: 'absolute', width: { xs: 180, md: 248 }, height: { xs: 180, md: 248 },
        top: { xs: 40, md: 20 }, right: { xs: 0, md: '5%' },
        background: 'rgba(115, 253, 170, 0.69)', filter: 'blur(69.5px)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Green glow blob — left */}
      <Box sx={{
        position: 'absolute', width: { xs: 160, md: 248 }, height: { xs: 160, md: 248 },
        top: { xs: -20, md: -40 }, left: { xs: -60, md: '-2%' },
        background: 'rgba(115, 253, 170, 0.5)', filter: 'blur(69.5px)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 2 }}>
          {/* Text content */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h1" sx={{
              fontFamily: 'Montserrat', fontWeight: 700,
              fontSize: { xs: '36px', sm: '48px', md: '58px', lg: '70px' },
              textAlign: { xs: 'center', md: 'left' },
              lineHeight: { xs: '1.15', md: '1.2' }, color: '#fff', mb: 3,
            }}>
              Save, Buy and Sell Your blockchain asset
            </Typography>
            <Typography sx={{
              fontFamily: 'Montserrat', fontWeight: 500,
              fontSize: { xs: '18px', md: '24px', lg: '32px' },
              lineHeight: { xs: '1.4', md: '1.4' }, color: '#fff', mb: 5, maxWidth: 500,
            }}>
              The easy to manage and trade your cryptocurency asset
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button onClick={() => router.push(user ? '/dashboard' : '/login')} variant="contained" sx={{
                background: '#BBFFFF', color: '#010010',
                fontFamily: 'Montserrat', fontWeight: 700, fontSize: '16px',
                borderRadius: '20px', px: '35px', py: '14px', textTransform: 'none',
                boxShadow: '0 0 20px rgba(187,255,255,0.3)',
                '&:hover': { background: '#73FDAA', boxShadow: '0 0 30px rgba(115,253,170,0.5)' },
                transition: 'all 0.3s ease',
                width: { xs: '100%', sm: 'auto' },
              }}>
                Connect Wallet
              </Button>
              <Button onClick={() => router.push(user ? '/dashboard' : '/login')} variant="contained" sx={{
                background: '#fff', color: '#010010',
                fontFamily: 'Montserrat', fontWeight: 700, fontSize: '16px',
                borderRadius: '20px', px: '35px', py: '14px', textTransform: 'none',
                boxShadow: '0 0 20px rgba(255,255,255,0.2)',
                '&:hover': { background: '#e8e8e8', boxShadow: '0 0 30px rgba(255,255,255,0.3)' },
                transition: 'all 0.3s ease',
                width: { xs: '100%', sm: 'auto' },
              }}>
                Start Trading
              </Button>
            </Stack>
          </Grid>

          {/* SVG Illustration */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
            <Box sx={{
              width: { xs: '100%', sm: 420, md: 500, lg: 560 },
              height: { xs: 280, sm: 340, md: 400, lg: 450 },
              flexShrink: 0,
            }}>
              {/* <CryptoIllustration /> */}
              {/* use image instead of illustration  give proper styleing*/}
              <img src="/image.png" alt="Hero Image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
