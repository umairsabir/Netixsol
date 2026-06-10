import { useEffect, useRef, useState } from 'react';
import {
  Box, Grid, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Chip, Stack, Alert, CircularProgress, useMediaQuery, useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import gsap from 'gsap';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import ProjectTimeline from '../components/ProjectTimeline';

const EMPTY = { title: '', description: '', techStack: '', status: 'active', members: [] };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const gridRef = useRef();
  const dialogRef = useRef();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchAll = async () => {
    try {
      const [p, m] = await Promise.all([api.get('/projects'), api.get('/members')]);
      setProjects(p.data);
      setMembers(m.data);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (!loading && gridRef.current?.children.length) {
      gsap.fromTo(gridRef.current.children, { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' });
    }
  }, [loading]);

  const openDialog = (project = null) => {
    setEditing(project);
    setForm(project
      ? { ...project, techStack: project.techStack.join(', '), members: project.members.map(m => m._id || m) }
      : EMPTY);
    setOpen(true);
    setTimeout(() => gsap.fromTo(dialogRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.4)' }), 10);
  };

  const handleSave = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    try {
      const payload = { ...form, techStack: form.techStack.split(',').map(t => t.trim()).filter(Boolean) };
      if (editing) await api.put(`/projects/${editing._id}`, payload);
      else await api.post('/projects', payload);
      setOpen(false);
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    fetchAll();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography fontWeight={800} sx={{ fontSize: { xs: '1.4rem', md: '28px' } }}>📁 Projects</Typography>
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
          Add Project
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid ref={gridRef} container spacing={{ xs: 2, md: 3 }}>
          {projects.map(p => (
            <Grid item xs={12} sm={6} md={4} key={p._id}>
              <ProjectCard project={p} onEdit={openDialog} onDelete={handleDelete}
                onTimeline={() => setSelectedProject(p)} />
            </Grid>
          ))}
          {projects.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" textAlign="center" mt={6}>No projects yet. Add one!</Typography>
            </Grid>
          )}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={fullScreen}>
        <Box ref={dialogRef}>
          <DialogTitle fontWeight={700}>{editing ? 'Edit Project' : 'New Project'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth required />
            <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={3} />
            <TextField label="Tech Stack (comma separated)" value={form.techStack} onChange={e => setForm({ ...form, techStack: e.target.value })} fullWidth />
            <TextField select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} fullWidth>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
            <TextField select label="Assign Members" value={form.members} onChange={e => setForm({ ...form, members: e.target.value })}
              SelectProps={{ multiple: true, renderValue: (sel) => (
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {sel.map(id => <Chip key={id} label={members.find(m => m._id === id)?.name || id} size="small" />)}
                </Stack>
              )}} fullWidth>
              {members.map(m => <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>)}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Timeline Dialog */}
      <Dialog open={!!selectedProject} onClose={() => setSelectedProject(null)} maxWidth="md" fullWidth>
        {selectedProject && (
          <ProjectTimeline projectId={selectedProject._id} projectTitle={selectedProject.title} />
        )}
        <Box sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => setSelectedProject(null)}>Close</Button>
        </Box>
      </Dialog>

    </Box>
  );
}
