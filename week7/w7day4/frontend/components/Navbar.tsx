'use client';

import { Box, Typography, IconButton, Container, Drawer, Badge } from "@mui/material";
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { usePathname } from 'next/navigation';
import { useState } from "react";
import { useGetCartQuery } from '../services/api';
import Link from 'next/link';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const sessionId = "default-session"; // Hardcoded session ID for demo
  const { data: cart } = useGetCartQuery(sessionId);

  const cartItemCount = cart?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "ALL", href: "/" },
    { label: "MEN", href: "/category/MEN" },
    { label: "WOMEN", href: "/category/WOMEN" },
    { label: "KIDS", href: "/category/KIDS" }
  ];

  const sidebarLinks = [
    { label: "ALL", href: "/" },
    { label: "MEN", href: "/category/MEN" },
    { label: "WOMEN", href: "/category/WOMEN" },
    { label: "KIDS", href: "/category/KIDS" },
    { label: "WORCOUT", href: "#" },
    { label: "RUN", href: "#" },
    { label: "FOOTBALL", href: "#" }
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && href !== '#' && pathname.startsWith(href)) return true;
    return false;
  };




  return (
    <Box sx={{ width: "100%", backgroundColor: "#FFFFFF", py: 2, borderBottom: "1px solid #EAEAEA" }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          {/* Mobile Menu Icon */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop Nav Links */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 4, alignItems: "center", flex: 1 }}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Box key={item.label} sx={{ position: "relative" }}>
                  <Link href={item.href} style={{ textDecoration: 'none' }}>
                    <Typography 
                      sx={{ 
                        cursor: "pointer", 
                        fontFamily: "var(--font-montserrat)", 
                        fontWeight: active ? 700 : 400,
                        fontSize: { xs: "14px", md: "16px" },
                        color: "#000000"
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Link>
                  {active && (
                    <Box sx={{ position: "absolute", bottom: -4, left: 0, width: "100%", height: "2px", backgroundColor: "#000000" }} />
                  )}
                </Box>
              );
            })}
          </Box>



          {/* Logo */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: { xs: "center", sm: "center" } }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontFamily: "var(--font-montserrat)", 
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: { xs: "20px", md: "24px" }
              }}
            >
              <span style={{ color: "#A0A0A0", fontWeight: 400 }}>your</span>
              <span style={{ color: "#000000", fontWeight: 900 }}>SNEAKER</span>
            </Typography>
          </Box>

          {/* Icons */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: { xs: 1, md: 2 } }}>
            <IconButton color="inherit" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <PersonOutlineOutlinedIcon />
            </IconButton>
            <IconButton color="inherit" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <SearchOutlinedIcon />
            </IconButton>
            <Link href="/cart" style={{ color: "inherit", display: "flex" }}>
              <IconButton color="inherit" sx={{ display: "flex" }}>
                <Badge badgeContent={cartItemCount} color="error">
                  <ShoppingBagOutlinedIcon />
                </Badge>
              </IconButton>
            </Link>
          </Box>
        </Box>
      </Container>
      
      {/* Full Screen Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: '100%',
            backgroundColor: '#FFFFFF' 
          },
        }}
      >
        <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
          
          {/* Top Bar inside Sidebar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <IconButton onClick={handleDrawerToggle} edge="start" sx={{ color: "#000000" }}>
              <CloseIcon sx={{ fontSize: "32px" }} />
            </IconButton>
            <Typography 
              sx={{ 
                fontFamily: "var(--font-montserrat)", 
                letterSpacing: "0.1em",
                fontSize: "18px"
              }}
            >
              <span style={{ color: "#A0A0A0", fontWeight: 400 }}>your</span>
              <span style={{ color: "#000000", fontWeight: 900 }}>SNEAKER</span>
            </Typography>
            <Link href="/cart" style={{ color: "inherit", display: "flex" }}>
              <IconButton sx={{ color: "#000000" }}>
                <Badge badgeContent={cartItemCount} color="error">
                  <ShoppingBagOutlinedIcon sx={{ fontSize: "32px" }} />
                </Badge>
              </IconButton>
            </Link>
          </Box>

          {/* Utility Links */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 6 }}>
             <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <SearchOutlinedIcon sx={{ fontSize: "36px", color: "#000000" }} />
                <Typography sx={{ fontFamily: "var(--font-montserrat)", fontSize: "24px", color: "#A0A0A0", fontWeight: 300 }}>
                  SEARCH
                </Typography>
             </Box>
             <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PersonOutlineOutlinedIcon sx={{ fontSize: "36px", color: "#000000" }} />
                <Typography sx={{ fontFamily: "var(--font-montserrat)", fontSize: "24px", color: "#A0A0A0", fontWeight: 300 }}>
                  LOGIN
                </Typography>
             </Box>
          </Box>

          {/* Navigation Categories */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            {sidebarLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Box key={item.label} sx={{ position: "relative", alignSelf: "flex-start" }}>
                  <Link href={item.href} style={{ textDecoration: 'none' }} onClick={handleDrawerToggle}>
                    <Typography 
                      sx={{ 
                        fontFamily: "var(--font-montserrat)", 
                        fontWeight: active ? 700 : 400, 
                        fontSize: "24px",
                        color: "#000000",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        letterSpacing: "0.05em",
                        pb: active ? 0.5 : 0
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Link>
                  {active && (
                    <Box sx={{ position: "absolute", bottom: -2, left: 0, width: "100%", height: "4px", backgroundColor: "#000000" }} />
                  )}
                </Box>
              );
            })}
          </Box>



          {/* Bottom Nike Logo */}
          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'center', pb: 4 }}>
             <Box 
               sx={{ 
                 width: "120px", 
                 height: "60px",
                 backgroundImage: "url('/design-and-css/desktop.png')", // Fallback map to right part once loaded 
                 backgroundSize: "contain",
                 backgroundPosition: "center",
                 backgroundRepeat: "no-repeat",
                 opacity: 0.8
               }} 
             />
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
