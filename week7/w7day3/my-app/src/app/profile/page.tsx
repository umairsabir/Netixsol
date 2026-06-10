'use client';

import { useGetMeQuery, useLogoutMutation } from '@/services/authApi';
import { useGetProfileQuery } from '@/services/userApi';
import {
  Avatar, Box, Button, Card, CardContent, Chip, CircularProgress,
  Container, Divider, Grid, Stack, Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { data: me, isLoading: meLoading, isError } = useGetMeQuery();
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery(undefined, { skip: !me });
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (!meLoading && isError) router.push('/login');
  }, [meLoading, isError, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (meLoading || profileLoading) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#010010', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#73FDAA' }} />
      </Box>
    );
  }

  const user = profile || me;

  return (
    <Box sx={{ minHeight: '100vh', background: '#010010', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', width: 300, height: 300, top: '10%', right: '5%', background: 'rgba(115,253,170,0.15)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Breadcrumb */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography sx={{ fontFamily: 'Montserrat', color: '#73FDAA', fontSize: '14px', fontWeight: 600 }}>Home</Typography>
          </Link>
          <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>/</Typography>
          <Typography sx={{ fontFamily: 'Montserrat', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Profile</Typography>
        </Stack>

        <Grid container spacing={4}>
          {/* Left: profile card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,253,170,0.25)', borderRadius: '20px' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar
                  src={profile?.picture}
                  alt={user?.name}
                  sx={{ width: 100, height: 100, mx: 'auto', mb: 2, border: '3px solid #73FDAA', boxShadow: '0 0 20px rgba(115,253,170,0.3)' }}
                />
                <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '22px', color: '#fff', mb: 0.5 }}>
                  {user?.name || 'User'}
                </Typography>
                <Chip
                  label="Verified Trader"
                  size="small"
                  sx={{ background: 'rgba(115,253,170,0.15)', color: '#73FDAA', fontFamily: 'Montserrat', fontWeight: 600, border: '1px solid rgba(115,253,170,0.3)', mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.4)',
                    fontFamily: 'Montserrat', fontWeight: 600, textTransform: 'none',
                    borderRadius: '12px', py: 1.2,
                    '&:hover': { borderColor: '#ff6b6b', background: 'rgba(255,107,107,0.08)' },
                  }}
                >
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Right: profile details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,253,170,0.25)', borderRadius: '20px', height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '20px', color: '#fff', mb: 3 }}>
                  Account Details
                </Typography>
                <Divider sx={{ borderColor: 'rgba(115,253,170,0.15)', mb: 3 }} />

                <Stack spacing={3}>
                  {[
                    { icon: <PersonIcon sx={{ color: '#73FDAA' }} />, label: 'Full Name', value: user?.name || '—' },
                    { icon: <EmailIcon sx={{ color: '#73FDAA' }} />, label: 'Email Address', value: user?.email || '—' },
                    { icon: <CalendarMonthIcon sx={{ color: '#73FDAA' }} />, label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                  ].map((item) => (
                    <Stack key={item.label} direction="row" spacing={2} >
                      <Box sx={{ mt: 0.3 }}>{item.icon}</Box>
                      <Box>
                        <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.3 }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: '16px', color: '#fff' }}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ borderColor: 'rgba(115,253,170,0.15)', my: 3 }} />

                <Box sx={{ p: 2.5, background: 'rgba(115,253,170,0.05)', border: '1px solid rgba(115,253,170,0.15)', borderRadius: '12px' }}>
                  <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '14px', color: '#73FDAA', mb: 0.5 }}>
                    🔒 Authentication Method
                  </Typography>
                  <Typography sx={{ fontFamily: 'Montserrat', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                    Google OAuth — your account is secured with Google&apos;s industry-standard authentication.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
