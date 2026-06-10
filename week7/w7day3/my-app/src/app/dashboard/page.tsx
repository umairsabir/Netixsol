'use client';

import { useGetMeQuery, useLogoutMutation, authApi } from '@/services/authApi';
import {
  Box, Button, Card, CardContent, Chip, CircularProgress,
  Container, Divider, Grid, Stack, Typography, Avatar,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Link from 'next/link';

const stats = [
  { label: 'Portfolio Value', value: '$12,450.00', change: '+3.24%', icon: <AccountBalanceWalletIcon />, color: '#73FDAA' },
  { label: 'Total Trades', value: '142', change: '+12 this week', icon: <SwapHorizIcon />, color: '#BBFFFF' },
  { label: 'BTC Holdings', value: '0.2143 BTC', change: '+1.41%', icon: <TrendingUpIcon />, color: '#F7931A' },
  { label: 'P&L (30d)', value: '+$842.30', change: '+7.25%', icon: <ShowChartIcon />, color: '#73FDAA' },
];

const recentActivity = [
  { type: 'Buy', asset: 'BTC', amount: '0.005 BTC', value: '$283.11', time: '2h ago', color: '#73FDAA' },
  { type: 'Sell', asset: 'ETH', amount: '0.5 ETH', value: '$2,133.95', time: '5h ago', color: '#ff6b6b' },
  { type: 'Buy', asset: 'BNB', amount: '2 BNB', value: '$1,175.48', time: '1d ago', color: '#73FDAA' },
  { type: 'Buy', asset: 'USDT', amount: '500 USDT', value: '$499.90', time: '2d ago', color: '#73FDAA' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: me, isLoading, isError } = useGetMeQuery();
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (!isLoading && isError) router.push('/login');
  }, [isLoading, isError, router]);

  const dispatch = useDispatch();
  const handleLogout = async () => {
    await logout();
    dispatch(authApi.util.resetApiState());
    router.push('/');
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#010010', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#73FDAA' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#010010', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', width: 300, height: 300, top: '5%', right: '5%', background: 'rgba(115,253,170,0.12)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', width: 200, height: 200, bottom: '10%', left: '2%', background: 'rgba(187,255,255,0.08)', filter: 'blur(70px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <Container maxWidth="xl" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack sx={{ justifyContent: 'space-between' }} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box>
            <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: { xs: '24px', md: '32px' }, color: '#fff' }}>
              Welcome back, {me?.name?.split(' ')[0] ?? 'Trader'} 👋
            </Typography>
            <Typography sx={{ fontFamily: 'Montserrat', color: 'rgba(255,255,255,0.5)', fontSize: '14px', mt: 0.5 }}>
              Here&apos;s your portfolio overview
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }} >
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <Stack direction="row" spacing={1} sx={{ cursor: 'pointer', p: 1, borderRadius: '10px', '&:hover': { background: 'rgba(115,253,170,0.08)' }, transition: '0.2s' }}>
                <Avatar sx={{ width: 36, height: 36, background: '#73FDAA', color: '#010010', fontSize: '15px', fontWeight: 700 }}>
                  {me?.name?.[0] ?? 'U'}
                </Avatar>
                <Typography sx={{ alignSelf: 'center', fontFamily: 'Montserrat', color: '#fff', fontWeight: 600, fontSize: '14px' }}>{me?.name}</Typography>
              </Stack>
            </Link>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              size="small"
              sx={{ color: '#ff6b6b', height: "40px", borderColor: 'rgba(255,107,107,0.4)', fontFamily: 'Montserrat', fontWeight: 600, textTransform: 'none', borderRadius: '10px', '&:hover': { borderColor: '#ff6b6b', background: 'rgba(255,107,107,0.08)' } }}
            >
              Logout
            </Button>
          </Stack>
        </Stack>

        {/* Stats Grid */}
        <Grid container sx={{ my: 3 }} spacing={3}>
          {stats.map((stat) => (
            <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card sx={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${stat.color}33`, borderRadius: '16px', transition: 'all 0.3s ease', '&:hover': { border: `1px solid ${stat.color}66`, boxShadow: `0 0 20px ${stat.color}15`, transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row">
                    <Box>
                      <Typography sx={{ fontFamily: 'Montserrat', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                        {stat.label}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '24px', color: '#fff', mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Chip label={stat.change} size="small" sx={{ background: `${stat.color}20`, color: stat.color, fontFamily: 'Montserrat', fontWeight: 600, fontSize: '11px', height: '22px' }} />
                    </Box>
                    <Box sx={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Card sx={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,253,170,0.2)', borderRadius: '20px' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '18px', color: '#fff', mb: 3 }}>
              Recent Activity
            </Typography>
            <Divider sx={{ borderColor: 'rgba(115,253,170,0.1)', mb: 3 }} />
            <Stack spacing={2}>
              {recentActivity.map((item, idx) => (
                <Stack key={idx} direction="row" sx={{ p: 2, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', '&:hover': { background: 'rgba(115,253,170,0.04)' }, transition: '0.2s' }}>
                  <Stack direction="row" spacing={2}>
                    <Chip label={item.type} size="small" sx={{ background: `${item.color}20`, color: item.color, fontFamily: 'Montserrat', fontWeight: 700, fontSize: '11px', width: '48px' }} />
                    <Box>
                      <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#fff', fontSize: '15px' }}>{item.asset}</Typography>
                      <Typography sx={{ fontFamily: 'Montserrat', color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{item.amount}</Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#fff', fontSize: '15px' }}>{item.value}</Typography>
                    <Typography sx={{ fontFamily: 'Montserrat', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{item.time}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
