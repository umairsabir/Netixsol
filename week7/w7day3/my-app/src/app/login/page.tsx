'use client';

import { Box, Button, Container, Divider, Paper, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
  const handleGoogleLogin = () => {
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
      }}
    >
      {/* Background glows */}
      <Box sx={{ position: 'absolute', width: 400, height: 400, top: '-10%', left: '-5%', background: 'rgba(115,253,170,0.25)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', width: 300, height: 300, bottom: '5%', right: '-5%', background: 'rgba(187,255,255,0.15)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '32px', color: '#fff', cursor: 'pointer' }}>
              <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="10" fill="white" />
                <circle cx="10" cy="48" r="10" fill="white" />
                <circle cx="48" cy="48" r="10" fill="white" />
                <circle cx="48" cy="10" r="10" fill="white" />
                <path d="M42 10H15" stroke="white" strokeWidth="3" />
                <path d="M12 16V42" stroke="white" strokeWidth="3" />
                <path d="M15 49H44" stroke="white" strokeWidth="3" />
                <path d="M49 44V29" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>

              Circlechain
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
            Welcome Back
          </Typography>
          <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 400, color: 'rgba(255,255,255,0.55)', textAlign: 'center', mb: 4, fontSize: '15px' }}>
            Sign in to access your crypto dashboard
          </Typography>

          <Button
            fullWidth
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{
              background: '#fff',
              color: '#010010',
              fontFamily: 'Montserrat',
              fontWeight: 700,
              fontSize: '16px',
              py: 1.8,
              borderRadius: '14px',
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
              '&:hover': {
                background: '#73FDAA',
                boxShadow: '0 4px 30px rgba(115,253,170,0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Continue with Google
          </Button>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontFamily: 'Montserrat', px: 1 }}>
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontFamily: 'Montserrat', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: '#73FDAA', fontWeight: 600, textDecoration: 'none' }}>
                Sign up
              </Link>
            </Typography>
          </Box>

          <Box sx={{ mt: 4, p: 2, background: 'rgba(115,253,170,0.05)', borderRadius: '12px', border: '1px solid rgba(115,253,170,0.15)' }}>
            <Typography sx={{ fontFamily: 'Montserrat', color: 'rgba(255,255,255,0.5)', fontSize: '12px', textAlign: 'center', lineHeight: 1.6 }}>
              🔒 Secured by Google OAuth. We never store your password. By signing in you agree to our Terms of Service.
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
