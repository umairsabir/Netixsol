'use client';

import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const perks = [
  'Access live crypto market data',
  'Buy and sell blockchain assets',
  'Secure Google authentication',
  'Real-time portfolio tracking',
];

export default function SignupPage() {
  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#010010',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 6,
      }}
    >
      {/* Background glows */}
      <Box sx={{ position: 'absolute', width: 350, height: 350, top: '5%', right: '5%', background: 'rgba(115,253,170,0.2)', filter: 'blur(90px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', width: 250, height: 250, bottom: '10%', left: '2%', background: 'rgba(187,255,255,0.12)', filter: 'blur(70px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '32px', color: '#fff' }}>
              🔗 Circlechain
            </Typography>
          </Link>
        </Box>

        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(115,253,170,0.25)',
            borderRadius: '20px',
            p: { xs: 4, md: 6 },
            backdropFilter: 'blur(12px)',
          }}
        >
          <Typography variant="h4" sx={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#fff', textAlign: 'center', mb: 1 }}>
            Create Account
          </Typography>
          <Typography sx={{ fontFamily: 'Montserrat', color: 'rgba(255,255,255,0.55)', textAlign: 'center', mb: 4, fontSize: '15px' }}>
            Join thousands of traders on Circlechain
          </Typography>

          {/* Perks */}
          <Stack spacing={1.5} sx={{ mb: 4 }}>
            {perks.map((perk) => (
              <Stack key={perk} direction="row" spacing={1.5} >
                <Typography sx={{ fontFamily: 'Montserrat', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                  {perk}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Button
            fullWidth
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignup}
            sx={{
              background: '#73FDAA',
              color: '#010010',
              fontFamily: 'Montserrat',
              fontWeight: 700,
              fontSize: '16px',
              py: 1.8,
              borderRadius: '14px',
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(115,253,170,0.3)',
              '&:hover': {
                background: '#BBFFFF',
                boxShadow: '0 4px 30px rgba(115,253,170,0.5)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Sign up with Google
          </Button>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography sx={{ fontFamily: 'Montserrat', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#73FDAA', fontWeight: 600, textDecoration: 'none' }}>
                Log in
              </Link>
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography sx={{ fontFamily: 'Montserrat', color: 'rgba(255,255,255,0.35)', fontSize: '13px', '&:hover': { color: '#73FDAA' }, transition: 'color 0.2s' }}>
              ← Back to Home
            </Typography>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
