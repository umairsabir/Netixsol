'use client';

import { Box, Container, Grid, IconButton, Stack, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';

const quickLinks = ['How it work', 'Blog', 'Support'];
const socialIcons = [FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon, CheckBoxOutlinedIcon];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid rgba(115,253,170,0.15)',
        pt: { xs: 6, md: 8 },
        pb: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Bottom left glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 200,
          height: 200,
          bottom: 0,
          left: 0,
          background: 'rgba(115, 253, 170, 0.1)',
          filter: 'blur(60px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 5, md: 4 }}>
          {/* Column 1: Logo + description */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Logo */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
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


              <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '24px', color: '#fff' }}>
                Circlechain
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontFamily: 'Montserrat',
                fontWeight: 700,
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 1)',
                lineHeight: '1.7',
                maxWidth: 300,
              }}
            >
              Amet minim mollit non deserunt ullamco est aliqua dolor do amet sint. Velit officia consequatduis enim velit mollit. Exercitation venlamconsequat sunt nostrud amet.
            </Typography>
          </Grid>

          {/* Column 2: Quick Links */}
          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <Typography
              sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '20px', color: '#fff', mb: 3 }}
            >
              Quick Link
            </Typography>
            <Stack spacing={2}>
              {quickLinks.map((link) => (
                <Typography
                  key={link}
                  sx={{
                    fontFamily: 'Montserrat',
                    fontWeight: 500,
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 1)',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    '&:hover': { color: '#73FDAA' },
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Stack>
          </Grid>

          {/* Column 3: Social Media */}
          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <Typography
              sx={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '20px', color: '#fff', mb: 3 }}
            >
              Social Media
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialIcons.map((Icon, idx) => (
                <IconButton
                  key={idx}
                  sx={{
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    width: 40,
                    height: 40,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#73FDAA',
                      border: '1px solid #73FDAA',
                      boxShadow: '0 0 10px rgba(115,253,170,0.3)',
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom copyright */}
        <Box
          sx={{
            mt: { xs: 5, md: 6 },
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'right',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Montserrat',
              fontWeight: 400,
              fontSize: '14px',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            (c) 2022 Circlechain
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
