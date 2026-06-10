'use client';

import { Box, Container, Divider, Grid, Stack, Typography } from '@mui/material';
import NorthEastIcon from '@mui/icons-material/NorthEast';

// Sparkline SVG path
function SparklineSVG({ color = '#73FDAA' }: { color?: string }) {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none">
      <polyline
        points="0,24 12,20 22,22 30,14 40,18 50,10 60,14 70,6 80,10"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const cryptos = [
  {
    name: 'BTC',
    fullName: 'BITCOIN',
    price: '$56,623.54',
    change: '1.41%',
    color: '#F7931A',
    iconBg: '#F7931A',
    iconChar: '₿',
  },
  {
    name: 'ETH',
    fullName: '■■■',
    price: '$4,267.90',
    change: '2.22%',
    color: '#627EEA',
    iconBg: '#627EEA',
    iconChar: 'Ξ',
  },
  {
    name: 'BNB',
    fullName: 'BINANCE',
    price: '$587.74',
    change: '0.82%',
    color: '#F3BA2F',
    iconBg: '#F3BA2F',
    iconChar: 'B',
  },
  {
    name: 'USDT',
    fullName: 'TETHER',
    price: '$0.9998',
    change: '0.03%',
    color: '#26A17B',
    iconBg: '#26A17B',
    iconChar: '₮',
  },
];

function CryptoCard({ crypto }: { crypto: typeof cryptos[0] }) {
  return (
    <Box
      sx={{
        background: '#010010',
        border: '1px solid #FFFFFF',
        borderRadius: '18px',
        p: '18px 20px',
        width: '100%',
        minHeight: '187px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '17px',
        boxShadow: '0px 1px 6px 4px rgba(115, 253, 170, 0.89)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 4px 12px 6px rgba(115, 253, 170, 0.95)',
        },
      }}
    >
      {/* Top row: icon + name + arrow */}
      <Stack direction="row">
        <Stack direction="row" spacing={2}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: crypto.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {crypto.iconChar}
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Typography sx={{ fontFamily: 'Raleway', fontWeight: 600, fontSize: '18px', color: '#FFFFFF', lineHeight: 1 }}>
              {crypto.name}
            </Typography>
            <Box sx={{ background: '#010010', borderRadius: '4px', px: '6px', py: '4px' }}>
              <Typography sx={{ fontFamily: 'Raleway', fontWeight: 600, fontSize: '10px', color: '#FFFFFF', textAlign: 'center' }}>
                {crypto.fullName}
              </Typography>
            </Box>
          </Stack>
        </Stack>
        <Box sx={{ position: 'relative', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ position: 'absolute', width: 34, height: 34, background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }} />
          <NorthEastIcon sx={{ color: '#FFFFFF', fontSize: '24px', zIndex: 1 }} />
        </Box>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', width: '100%' }} />

      {/* Price + sparkline */}
      <Stack direction="row" >
        <Box>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '24px', color: '#FFFFFF', mb: 1 }}>
            {crypto.price}
          </Typography>
          <Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', color: '#FFFFFF' }}>
            {crypto.change}
          </Typography>
        </Box>
        <Box sx={{ width: 100, display: 'flex', justifyContent: 'center' }}>
          <SparklineSVG color="#73FDAA" />
        </Box>
      </Stack>
    </Box>
  );
}

const rows = [0, 1, 2, 3]; // 4 rows

export default function MarketTrend() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle green glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          bottom: '10%',
          right: '5%',
          background: 'rgba(115, 253, 170, 0.08)',
          filter: 'blur(80px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>

        {/* in small i want text to be in center of Market Trend and in large it should be in left */}
        <Typography
          variant="h2"
          sx={{
            fontFamily: 'Montserrat',
            fontWeight: 700,
            fontSize: { xs: '32px', md: '36px' },
            color: '#fff',
            mb: { xs: 4, md: 5 },
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          Market Trend
        </Typography>

        <Stack spacing={5}>
          {rows.map((rowIdx) => (
            <Grid container spacing={5} key={rowIdx}>
              {cryptos.map((crypto) => (
                // i want padding in small only
                <Grid size={{ xs: 12, sm: 6, md: 3, }} sx={{ px: { xs: 4, sm: 0 } }} key={`${rowIdx}-${crypto.name}`}>
                  <CryptoCard crypto={crypto} />
                </Grid>
              ))}
            </Grid>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
