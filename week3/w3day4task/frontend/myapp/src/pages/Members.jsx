import { useEffect, useRef, useState } from 'react';
import {
  Box, Grid, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, Snackbar, useMediaQuery, useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import gsap from 'gsap';
import api from '../services/api';
import MemberCard from '../components/MemberCard';

const EMPTY = { name: '', role: '', email: '' };

export default function Members() {
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState('');
  const gridRef = useRef();
  const dialogRef = useRef();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/members');
      setMembers(data);
    } catch { setError('Failed to load members'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  useEffect(() => {
    if (!loading && gridRef.current?.children.length) {
      gsap.fromTo(gridRef.current.children, { opacity: 0, x: -30 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.45, ease: 'power2.out' });
    }
  }, [loading]);

  const openDialog = (member = null) => {
    setEditing(member);
    setForm(member ? { name: member.name, role: member.role, email: member.email } : EMPTY);
    setOpen(true);
    setTimeout(() => gsap.fromTo(dialogRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.4)' }), 10);
  };

  const handleSave = async () => {
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.role.trim()) { setError('Role is required'); return; }
    if (!form.email.trim()) { setError('Email is required'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) { setError('Invalid email format'); return; }
    try {
      if (editing) await api.put(`/members/${editing._id}`, form);
      else await api.post('/members', form);
      setOpen(false);
      setSnack(editing ? 'Member updated!' : 'Member added successfully! 🎉');
      fetchMembers();
    } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this member?')) return;
    await api.delete(`/members/${id}`);
    setSnack('Member removed.');
    fetchMembers();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography fontWeight={800} sx={{ fontSize: { xs: '1.4rem', md: '28px' } }}>👥 Team Members</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}
          sx={{ borderRadius: 2, fontSize: { xs: '0.9rem', md: '0.95rem' }, py: { xs: 1, md: 1.2 }, px: { xs: 2.5, md: 3 },
            textTransform: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'scale(1.03)',
              boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
            }
          }}>
          Add Member
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid ref={gridRef} container spacing={{ xs: 2, md: 3 }}>
          {members.map(m => (
            <Grid item xs={12} sm={6} md={3} key={m._id}>
              <MemberCard member={m} onEdit={openDialog} onDelete={handleDelete} />
            </Grid>
          ))}
          {members.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" textAlign="center" mt={6}>No members yet. Add one!</Typography>
            </Grid>
          )}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth fullScreen={fullScreen}>
        <Box ref={dialogRef}>
          <DialogTitle fontWeight={700}>{editing ? 'Edit Member' : 'Add Member'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth required />
            <TextField label="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} fullWidth required />
            <TextField label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth required />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}
