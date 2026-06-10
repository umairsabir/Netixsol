import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import gsap from 'gsap';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Members from './pages/Members';

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function PageTransition({ children }) {
  const ref = useRef();
  const location = useLocation();

  useEffect(() => {
    const el = ref.current;
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
    );
  }, [location.pathname]);

  return <Box ref={ref}>{children}</Box>;
}

function AppLayout({ mode, toggleMode }) {
  const location = useLocation();
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navbar mode={mode} toggleMode={toggleMode} />
      <PageTransition>
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </Box>
  );
}

export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('themeMode', next);
  };

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#667eea' },
      secondary: { main: '#764ba2' },
    },
    typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
    shape: { borderRadius: 10 },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppLayout mode={mode} toggleMode={toggleMode} />
      </BrowserRouter>
    </ThemeProvider>
  );
}
