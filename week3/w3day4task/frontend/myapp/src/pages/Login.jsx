import { useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import api from '../services/api';

const fieldSx = {
  '& .MuiOutlinedInput-root': { '& fieldset': { borderWidth: '1.5px' } },
  '& .MuiInputBase-input': { fontSize: '15px', padding: '12px 14px' },
  '& .MuiInputLabel-root': { fontSize: '15px' },
};

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Invalid email format';
    if (!form.password.trim()) return 'Password is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (isRegister && !form.name.trim()) return 'Full name is required';
    return null;
  };
  const cardRef = useRef();
  const fieldsRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      const children = fieldsRef.current ? Array.from(fieldsRef.current.children) : [];
      if (children.length) {
        gsap.fromTo(children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.5, delay: 0.3, ease: 'power2.out' });
      }
    });
    return () => ctx.revert();
  }, [isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      if (isRegister) {
        setIsRegister(false);
        setForm({ name: '', email: '', password: '' });
        setError('');
      } else {
        sessionStorage.setItem('token', data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      px: 2,
      py: 4,
    }}>
      <Card ref={cardRef} sx={{
        width: '100%',
        maxWidth: '420px',
        borderRadius: 3,
        boxShadow: 8,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <CardContent sx={{
          p: { xs: 3, sm: 4 },
          pt: { xs: '30px', md: '40px' },
          pb: { xs: '24px', md: '32px' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexGrow: 1,
          textAlign: 'center',
        }}>
          <Typography fontWeight={900} textAlign="center" mt={2} mb={1}
            sx={{ fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' } }}>
            {isRegister ? '🚀 Register' : '👋 Welcome Back'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, width: '100%', py: 0.5 }}>{error}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            ref={fieldsRef}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}
          >
            <Typography color="text.secondary" textAlign="center" mb={1}
              sx={{ fontSize: { xs: '0.9rem', sm: '0.95rem' }, width: '100%' }}>
              {isRegister ? 'Create your account' : 'Sign in to TeamPortal'}
            </Typography>

            {isRegister && (
              <TextField
                label="Full Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                fullWidth
                sx={fieldSx}
                size="small"
              />
            )}

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              fullWidth
              sx={fieldSx}
              size="small"
            />

            <TextField
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              fullWidth
              sx={fieldSx}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                      {showPass
                        ? <VisibilityOff sx={{ fontSize: '20px' }} />
                        : <Visibility sx={{ fontSize: '20px' }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ borderRadius: 2, py: 1.2, fontWeight: 700, fontSize: '0.95rem', mt: 1, textTransform: 'none' }}
            >
              {isRegister ? 'Register' : 'Login'}
            </Button>

            <Typography variant="body2" textAlign="center" mt={1} sx={{ fontSize: '14px' }}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Button
                size="small"
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                sx={{ fontSize: '14px', textTransform: 'none', ml: 0.5, fontWeight: 600 }}
              >
                {isRegister ? 'Login' : 'Register'}
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
