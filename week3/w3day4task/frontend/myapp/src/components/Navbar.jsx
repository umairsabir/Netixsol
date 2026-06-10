import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box,
  Drawer, List, ListItem, ListItemButton, ListItemText, Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ mode, toggleMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isAuth = location.pathname === '/login';

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  if (isAuth) return null;

  const navLinks = [
    { label: 'Dashboard', path: '/' },
    { label: 'Projects', path: '/projects' },
    { label: 'Members', path: '/members' },
  ];

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Toolbar sx={{ py: { xs: '8px', md: '12px' }, px: { xs: '16px', md: '32px' } }}>

          {/* Logo */}
          <DashboardIcon sx={{ mr: 2, fontSize: { xs: '22px', md: '26px' } }} />
          <Typography
            sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer', fontSize: { xs: '20px', md: '24px' } }}
            onClick={() => navigate('/')}
          >
            TeamPortal
          </Typography>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
            {navLinks.map(link => (
              <Button key={link.path} color="inherit" onClick={() => navigate(link.path)}
                sx={{ fontSize: { md: '14px', lg: '15px' }, textTransform: 'none', fontWeight: 500 }}>
                {link.label}
              </Button>
            ))}
            <IconButton color="inherit" onClick={toggleMode}>
              {mode === 'dark' ? <Brightness7Icon sx={{ fontSize: '22px' }} /> : <Brightness4Icon sx={{ fontSize: '22px' }} />}
            </IconButton>
            <Button
              variant="contained"
              onClick={handleLogout}
              sx={{
                fontSize: { md: '13px', lg: '14px' },
                bgcolor: 'error.main',
                color: 'white',
                borderRadius: '6px',
                px: 2.5,
                py: 0.8,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'error.dark',
                  transform: 'scale(1.03)',
                  boxShadow: '0 4px 12px rgba(211,47,47,0.3)',
                },
              }}
            >Logout</Button>
          </Box>

          {/* Mobile Icons */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" onClick={toggleMode}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>

        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 220, pt: 2 }}>
          <List>
            {navLinks.map(link => (
              <ListItem key={link.path} disablePadding>
                <ListItemButton onClick={() => { navigate(link.path); setDrawerOpen(false); }}>
                  <ListItemText primary={link.label} primaryTypographyProps={{ fontSize: '18px', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => { handleLogout(); setDrawerOpen(false); }}
              sx={{
                bgcolor: 'error.main', color: 'white', fontSize: '16px', borderRadius: '8px',
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >Logout</Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
