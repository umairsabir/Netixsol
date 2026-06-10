'use client';

import {
  AppBar, Box, Button, Container, IconButton, Stack,
  Toolbar, Typography, Drawer, List, ListItem, ListItemText,
  Avatar, Menu, MenuItem, Divider, CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';
import Link from 'next/link';
import { authApi, useGetMeQuery, useLogoutMutation } from '@/services/authApi';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

const navLinks = ['How it work', 'Blog', 'Support'];

export default function Navbar() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: user, isLoading } = useGetMeQuery();
  const [logout] = useLogoutMutation();

  const dispatch = useDispatch();
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    // Manually reset the API state to clear user info from UI instantly
    dispatch(authApi.util.resetApiState());
    router.push('/');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ position: 'absolute', zIndex: 1000, background: 'transparent', py: 1 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', gap: 2 }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0, cursor: 'pointer', alignItems: 'center' }}>
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

              <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: { xs: '22px', md: '28px' }, color: '#fff', lineHeight: 1 }}>
                Circlechain
              </Typography>
            </Stack>
          </Link>

          {/* Nav Links — desktop */}
          <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navLinks.map((link) => (
              <Button key={link} sx={{ color: '#fff', fontFamily: 'Montserrat', fontWeight: 500, fontSize: '16px', textTransform: 'none', p: 0, '&:hover': { color: '#73FDAA', background: 'transparent' } }}>
                {link}
              </Button>
            ))}
          </Stack>

          {/* Right side — desktop */}
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {/* Social Icons */}
            {[FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon, CheckBoxOutlinedIcon].map((Icon, idx) => (
              <IconButton key={idx} size="small" sx={{ color: '#fff', '&:hover': { color: '#73FDAA' } }}>
                <Icon fontSize="small" />
              </IconButton>
            ))}


            {/* Auth */}
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: '#73FDAA' }} />
            ) : user ? (
              <>
                <Stack
                  direction="row" spacing={1}
                  onClick={handleMenuOpen}
                  sx={{ cursor: 'pointer', alignItems: 'center', p: '6px 12px', borderRadius: '20px', border: '1px solid rgba(115,253,170,0.3)', '&:hover': { background: 'rgba(115,253,170,0.08)' }, transition: '0.2s' }}
                >
                  <Avatar sx={{ width: 28, height: 28, background: '#73FDAA', color: '#010010', fontSize: '13px', fontWeight: 700 }}>
                    {user.name?.[0] ?? 'U'}
                  </Avatar>
                  <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '14px', color: '#fff' }}>
                    {user.name?.split(' ')[0]}
                  </Typography>
                  <KeyboardArrowDownIcon sx={{ color: '#73FDAA', fontSize: '18px' }} />
                </Stack>
                <Menu
                  anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => { handleMenuClose(); router.push('/dashboard'); }}
                    sx={{ fontFamily: 'Montserrat', fontSize: '14px', color: '#fff', '&:hover': { background: 'rgba(115,253,170,0.08)', color: '#73FDAA' } }}>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { handleMenuClose(); router.push('/profile'); }}
                    sx={{ fontFamily: 'Montserrat', fontSize: '14px', color: '#fff', '&:hover': { background: 'rgba(115,253,170,0.08)', color: '#73FDAA' } }}>
                    Profile
                  </MenuItem>
                  <Divider sx={{ borderColor: 'rgba(115,253,170,0.1)' }} />
                  <MenuItem onClick={handleLogout}
                    sx={{ fontFamily: 'Montserrat', fontSize: '14px', color: '#ff6b6b', '&:hover': { background: 'rgba(255,107,107,0.08)' } }}>
                    Log Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Stack direction="row" spacing={1.5}>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Button sx={{ color: '#fff', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '14px', textTransform: 'none', '&:hover': { color: '#73FDAA', background: 'transparent' } }}>
                    Log In
                  </Button>
                </Link>
                <Link href="/signup" style={{ textDecoration: 'none' }}>
                  <Button variant="contained" sx={{ background: '#73FDAA', color: '#010010', fontFamily: 'Montserrat', fontWeight: 700, fontSize: '14px', textTransform: 'none', borderRadius: '20px', px: 2.5, py: 0.8, '&:hover': { background: '#BBFFFF', boxShadow: '0 0 15px rgba(115,253,170,0.4)' }, transition: 'all 0.3s' }}>
                    Sign Up
                  </Button>
                </Link>
              </Stack>
            )}
          </Stack>

          {/* Mobile hamburger */}
          <IconButton sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff' }} onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        sx={{ background: '#01001a', color: '#fff', width: 260, pt: 2 }}>
        <List>
          {navLinks.map((link) => (
            <ListItem key={link} onClick={() => setDrawerOpen(false)} sx={{ cursor: 'pointer', '&:hover': { color: '#73FDAA' } }}>
              <ListItemText primary={link} sx={{ fontFamily: 'Montserrat', fontWeight: 600 }} />
            </ListItem>
          ))}
          <Divider sx={{ borderColor: 'rgba(115,253,170,0.15)', my: 1 }} />
          {user ? (
            <>
              <ListItem onClick={() => { setDrawerOpen(false); router.push('/dashboard'); }} sx={{ cursor: 'pointer', '&:hover': { color: '#73FDAA' } }}>
                <ListItemText primary="Dashboard" sx={{ fontFamily: 'Montserrat', fontWeight: 600 }} />
              </ListItem>
              <ListItem onClick={() => { setDrawerOpen(false); router.push('/profile'); }} sx={{ cursor: 'pointer', '&:hover': { color: '#73FDAA' } }}>
                <ListItemText primary="Profile" sx={{ fontFamily: 'Montserrat', fontWeight: 600 }} />
              </ListItem>
              <ListItem onClick={() => { setDrawerOpen(false); handleLogout(); }} sx={{ cursor: 'pointer', color: '#ff6b6b' }}>
                <ListItemText primary="Log Out" sx={{ fontFamily: 'Montserrat', fontWeight: 600, color: '#ff6b6b' }} />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem onClick={() => { setDrawerOpen(false); router.push('/login'); }} sx={{ cursor: 'pointer', '&:hover': { color: '#73FDAA' } }}>
                <ListItemText primary="Log In" sx={{ fontFamily: 'Montserrat', fontWeight: 600 }} />
              </ListItem>
              <ListItem sx={{ px: 2, pt: 1 }}>
                <Button fullWidth variant="contained" onClick={() => { setDrawerOpen(false); router.push('/signup'); }}
                  sx={{ background: '#73FDAA', color: '#010010', fontFamily: 'Montserrat', fontWeight: 700, textTransform: 'none', borderRadius: '20px' }}>
                  Sign Up
                </Button>
              </ListItem>
            </>
          )}
        </List>
        <Stack direction="row" spacing={0.5} sx={{ px: 2, pt: 2 }}>
          {[FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon].map((Icon, idx) => (
            <IconButton key={idx} size="small" sx={{ color: '#fff' }}><Icon fontSize="small" /></IconButton>
          ))}
        </Stack>
      </Drawer>
    </AppBar>
  );
}
