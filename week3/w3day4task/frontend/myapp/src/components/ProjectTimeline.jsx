import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Stepper, Step, StepLabel, StepContent,
  Paper, Button, TextField, IconButton, Checkbox, FormControlLabel,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import gsap from 'gsap';
import api from '../services/api';

export default function ProjectTimeline({ projectId, projectTitle }) {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState([{ label: '', description: '', completed: false }]);
  const containerRef = useRef();

  const fetchTimeline = async () => {
    try {
      const { data } = await api.get(`/timeline/${projectId}`);
      setTimeline(data);
      if (data?.steps) setSteps(data.steps);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTimeline(); }, [projectId]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const stepEls = containerRef.current.querySelectorAll('.MuiStep-root');
      if (stepEls.length) {
        gsap.fromTo(stepEls,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, stagger: 0.15, duration: 0.5, ease: 'power2.out' }
        );
      }
    }
  }, [loading, timeline]);

  const handleSave = async () => {
    try {
      const validSteps = steps.filter(s => s.label.trim() !== '');
      if (validSteps.length === 0) return;
      const { data } = await api.post(`/timeline/${projectId}`, { steps: validSteps });
      setTimeline(data);
      setSteps(data.steps);
      setOpen(false);
    } catch (err) {
      console.error('Timeline save error:', err.response?.data || err.message);
    }
  };

  const toggleStep = async (index) => {
    try {
      const { data } = await api.patch(`/timeline/${projectId}/step/${index}`, {
        completed: !timeline.steps[index].completed
      });
      setTimeline(data);
    } catch (err) {
      console.error('Toggle step error:', err.response?.data || err.message);
    }
  };

  const addStep = () => setSteps([...steps, { label: '', description: '', completed: false }]);
  const removeStep = (i) => setSteps(steps.filter((_, idx) => idx !== i));
  const updateStep = (i, field, val) => {
    const updated = [...steps];
    updated[i][field] = val;
    setSteps(updated);
  };

  const completedCount = timeline?.steps?.filter(s => s.completed).length || 0;
  const totalCount = timeline?.steps?.length || 0;

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography fontWeight={700} sx={{ fontSize: { xs: '1.2rem', md: '1.8rem' } }}>
            📅 {projectTitle} — Timeline
          </Typography>
          {totalCount > 0 && (
            <Chip
              label={`${completedCount}/${totalCount} completed`}
              color={completedCount === totalCount ? 'success' : 'primary'}
              size="small" sx={{ mt: 0.5 }}
            />
          )}
        </Box>
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => { setSteps(timeline?.steps || [{ label: '', description: '', completed: false }]); setOpen(true); }}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          {timeline ? 'Edit Timeline' : 'Create Timeline'}
        </Button>
      </Box>

      {!timeline || timeline.steps.length === 0 ? (
        <Typography color="text.secondary">No timeline yet. Create one!</Typography>
      ) : (
        <Box ref={containerRef}>
          <Stepper orientation="vertical">
            {timeline.steps.map((step, i) => (
              <Step key={i} active={!step.completed} completed={step.completed}>
                <StepLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' },
                      textDecoration: step.completed ? 'line-through' : 'none',
                      color: step.completed ? 'text.secondary' : 'text.primary' }}>
                      {step.label}
                    </Typography>
                    <Checkbox size="small" checked={step.completed} onChange={() => toggleStep(i)} />
                  </Box>
                </StepLabel>
                <StepContent>
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                    {step.description}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {completedCount === totalCount && totalCount > 0 && (
            <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: 'success.main', borderRadius: 2 }}>
              <Typography color="white" fontWeight={600}>🎉 All phases completed successfully!</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{timeline ? 'Edit Timeline' : 'Create Timeline'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {steps.map((step, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography fontWeight={600}>Step {i + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => removeStep(i)}><DeleteIcon /></IconButton>
              </Box>
              <TextField label="Step Title" value={step.label} onChange={e => updateStep(i, 'label', e.target.value)} fullWidth size="small" required />
              <TextField label="Description" value={step.description} onChange={e => updateStep(i, 'description', e.target.value)} fullWidth size="small" multiline rows={2} />
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addStep} variant="outlined">Add Step</Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Timeline</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
