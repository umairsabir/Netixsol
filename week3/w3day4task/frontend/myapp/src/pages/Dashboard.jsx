import { useEffect, useRef, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import api from '../services/api';
import { countUp } from '../components/animations/gsapUtils';

const StatCard = ({ icon, label, value, color }) => {
  const numRef = useRef();
  useEffect(() => { if (numRef.current) countUp(numRef.current, value); }, [value]);
  return (
    <Card sx={{ borderTop: `4px solid ${color}`, borderRadius: 2, width: '100%', display: 'flex', alignItems: 'center', py: 1.5 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '12px !important' }}>
        <Box sx={{ color, display: 'flex', fontSize: { xs: 32, md: 42 } }}>{icon}</Box>
        <Box>
          <Typography ref={numRef} fontWeight={800} sx={{ fontSize: { xs: '1.3rem', md: '24px' }, lineHeight: 1.2 }}>0</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '13px' } }}>{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const heroRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();
  const btnRef = useRef();
  const statsRef = useRef();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, members: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
        .fromTo(titleRef.current, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.2')
        .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
        .fromTo(btnRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3');
      if (statsRef.current?.children.length) {
        tl.fromTo(statsRef.current.children, { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.5, ease: 'power2.out' }, '-=0.2');
      }
    });

    const fetchStats = async () => {
      try {
        const [proj, mem] = await Promise.all([api.get('/projects'), api.get('/members')]);
        setStats({
          total: proj.data.length,
          active: proj.data.filter(p => p.status === 'active').length,
          completed: proj.data.filter(p => p.status === 'completed').length,
          members: mem.data.length,
        });
      } catch { }
    };
    fetchStats();
    return () => ctx.revert();
  }, []);

  return (
    <Box>
      {/* Hero */}
      <Box ref={heroRef} sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 5, md: 7 },
        px: { xs: 2, md: 4 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* SVG Path Animation */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.15 }}>
          <svg width="100%" height="100%" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path id="svgPath1" d="M0,200 C300,50 600,350 900,150 C1050,50 1150,250 1200,200" fill="none" stroke="white" strokeWidth="3"
              strokeDasharray="2000" strokeDashoffset="2000">
              <animate attributeName="stroke-dashoffset" from="2000" to="0" dur="3s" fill="freeze" />
            </path>
            <path d="M0,300 C200,150 500,400 800,250 C1000,150 1100,350 1200,300" fill="none" stroke="white" strokeWidth="2"
              strokeDasharray="2000" strokeDashoffset="2000">
              <animate attributeName="stroke-dashoffset" from="2000" to="0" dur="4s" fill="freeze" begin="0.5s" />
            </path>
            <circle cx="100" cy="100" r="60" fill="white" opacity="0.1">
              <animate attributeName="r" values="60;80;60" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="1100" cy="300" r="80" fill="white" opacity="0.08">
              <animate attributeName="r" values="80;100;80" dur="5s" repeatCount="indefinite" />
            </circle>
          </svg>
        </Box>
        <Typography ref={titleRef} fontWeight={900} gutterBottom
          sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.2rem' }, position: 'relative', zIndex: 1, mb: 1.5 }}>
          🚀 Team & Project Portal
        </Typography>
        <Typography ref={subtitleRef} sx={{ opacity: 0.9, mb: 3.5, fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }, position: 'relative', zIndex: 1 }}>
          Manage your team, showcase projects, and track progress — all in one place.
        </Typography>
        <Box ref={btnRef} sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate('/projects')}
            sx={{ borderRadius: 3, px: { xs: 3, md: 4 }, fontWeight: 700, fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }, py: { xs: 1, md: 1.3 }, textTransform: 'none',
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
            }}>
            View Projects
          </Button>
          <Button variant="outlined" onClick={() => navigate('/members')}
            sx={{ borderRadius: 3, px: { xs: 3, md: 4 }, fontWeight: 700, color: 'white', borderColor: 'white', fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }, py: { xs: 1, md: 1.3 }, textTransform: 'none',
              animation: 'float2 3s ease-in-out infinite',
              '@keyframes float2': { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
              animationDelay: '0.5s',
            }}>
            Meet the Team
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ p: { xs: 3, md: 4 } }}>
        <Typography fontWeight={700} mb={2.5} sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' } }}>📊 Overview</Typography>
        <Grid ref={statsRef} container spacing={{ xs: 2, md: 3 }} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<FolderOpenIcon fontSize="inherit" />} label="Total Projects" value={stats.total} color="#667eea" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<RocketLaunchIcon fontSize="inherit" />} label="Active Projects" value={stats.active} color="#43e97b" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<CheckCircleIcon fontSize="inherit" />} label="Completed" value={stats.completed} color="#f093fb" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<GroupIcon fontSize="inherit" />} label="Team Members" value={stats.members} color="#4facfe" />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
