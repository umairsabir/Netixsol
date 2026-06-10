'use client';

import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import MarketTrend from '@/components/MarketTrend';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#010010',
    },
    primary: {
      main: '#73FDAA',
    },
    secondary: {
      main: '#BBFFFF',
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '30px',
          paddingRight: '30px',
          '@media (min-width: 1200px)': {
            paddingLeft: '70px',
            paddingRight: '70px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
  },
});

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main style={{ background: '#010010', minHeight: '100vh' }}>
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <MarketTrend />
        <Newsletter />
        <Footer />
      </main>
    </ThemeProvider>
  );
}
