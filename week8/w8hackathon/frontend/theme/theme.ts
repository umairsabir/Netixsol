import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#a855f7', // Purple
    },
    background: {
      default: '#020617', // Deeper Dark Slate
      paper: '#0f172a',
    },
    divider: 'rgba(255, 255, 255, 0.05)',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.4)',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#fff',
          },
        },
      ],
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 0',
        },
      },
    },
  },
});

export default theme;
