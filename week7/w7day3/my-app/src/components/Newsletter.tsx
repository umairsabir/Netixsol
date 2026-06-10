'use client';

import { Box, Button, Container, InputBase, Snackbar, Alert, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useSubscribeMutation } from '@/services/newsletterApi';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const [subscribe, { isLoading }] = useSubscribeMutation();

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    try {
      const result = await subscribe({ email }).unwrap();
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      setEmail('');
    } catch (err: any) {
      const msg =
        err?.data?.message ?? 'Something went wrong. Please try again.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 10 }, position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="xl">
        <Box sx={{
          position: 'relative', borderRadius: '16px', overflow: 'hidden',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(115, 253, 170, 0.2)',
          py: { xs: 6, md: 8 }, px: { xs: 3, md: 8 }, textAlign: 'center',
        }}>
          {/* Glow blobs */}
          <Box sx={{
            position: 'absolute', width: { xs: 200, md: 300 }, height: { xs: 200, md: 300 },
            bottom: '-30%', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(115, 253, 170, 0.35)', filter: 'blur(80px)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'absolute', width: { xs: 120, md: 200 }, height: { xs: 120, md: 200 },
            top: '-20%', left: '30%',
            background: 'rgba(115, 253, 170, 0.2)', filter: 'blur(60px)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{
              fontFamily: 'Montserrat', fontWeight: 700,
              fontSize: { xs: '22px', sm: '28px', md: '36px' },
              color: '#fff', mb: { xs: 4, md: 5 },
            }}>
              Want to be aware of all update
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}

              sx={{
                maxWidth: 580, mx: 'auto', justifyContent: "center",
                alignItems: "stretch"
              }}
            >
              <InputBase
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                type="email"
                sx={{
                  flex: 1, px: 3, py: 1.5,
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: { xs: '12px 12px 0 0', sm: '12px 0 0 12px' },
                  color: '#fff', fontFamily: 'Montserrat', fontSize: '15px',
                  border: '1px solid rgba(115, 253, 170, 0.3)',
                  '& input::placeholder': { color: 'rgba(255,255,255,0.4)' },
                  '&:focus-within': {
                    border: '1px solid rgba(115, 253, 170, 0.7)',
                    boxShadow: '0 0 12px rgba(115,253,170,0.15)',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
              <Button
                variant="contained"
                disabled={isLoading}
                onClick={handleSubscribe}
                sx={{
                  background: '#73FDAA', color: '#010010',
                  fontFamily: 'Montserrat', fontWeight: 700, fontSize: '15px',
                  px: 4, py: 1.8,
                  borderRadius: { xs: '0 0 12px 12px', sm: '0 12px 12px 0' },
                  textTransform: 'none', flexShrink: 0,
                  '&:hover': { background: '#BBFFFF', boxShadow: '0 0 20px rgba(115,253,170,0.4)' },
                  '&:disabled': { background: 'rgba(115,253,170,0.4)', color: '#010010' },
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ fontFamily: 'Montserrat', background: snackbar.severity === 'success' ? '#73FDAA' : undefined, color: snackbar.severity === 'success' ? '#010010' : undefined }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
