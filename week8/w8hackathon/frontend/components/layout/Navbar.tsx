'use client';

import { AppBar, Toolbar, Typography, Box, Container } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

export default function Navbar() {
  return (
    <AppBar position="sticky" elevation={0} sx={{ 
      background: 'rgba(15, 23, 42, 0.8)', 
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoStoriesIcon sx={{ display: { xs: 'none', md: 'flex' }, color: 'primary.main' }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 4,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: 'inherit',
                textDecoration: 'none',
                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SMARTDOC
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 20, 
              bgcolor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
              <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 600 }}>SYSTEM LIVE</Typography>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
