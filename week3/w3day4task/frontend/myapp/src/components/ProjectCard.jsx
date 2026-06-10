import { Card, CardContent, CardActions, Typography, Chip, Box, Button, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRef } from 'react';
import gsap from 'gsap';

export default function ProjectCard({ project, onEdit, onDelete, onTimeline }) {
  const cardRef = useRef();

  const handleMouseEnter = () => gsap.to(cardRef.current, { y: -6, boxShadow: '0 12px 30px rgba(0,0,0,0.2)', duration: 0.3 });
  const handleMouseLeave = () => gsap.to(cardRef.current, { y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', duration: 0.3 });

  return (
    <Card ref={cardRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'default', transition: 'none' }}>
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1.5 }}>
          <Typography fontWeight={700} sx={{ fontSize: '1.15rem', lineHeight: 1.3 }}>{project.title}</Typography>
          <Chip label={project.status} size="small"
            color={project.status === 'active' ? 'success' : 'default'}
            sx={{ fontSize: '11px', height: '22px' }} />
        </Box>
        <Typography color="text.secondary" sx={{ mb: 2, fontSize: '13px', lineHeight: 1.5 }}>{project.description}</Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1.5 }}>
          {project.techStack?.map(t => <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: '11px', height: '22px' }} />)}
        </Stack>
        {project.members?.length > 0 && (
          <Typography color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '13px', fontWeight: 500 }}>
            👥 {project.members.map(m => m.name || m).join(', ')}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button size="small" startIcon={<EditIcon sx={{ fontSize: '15px !important' }} />} onClick={() => onEdit(project)} sx={{ fontSize: '13px', textTransform: 'none' }}>Edit</Button>
        <Button size="small" color="error" startIcon={<DeleteIcon sx={{ fontSize: '15px !important' }} />} onClick={() => onDelete(project._id)} sx={{ fontSize: '13px', textTransform: 'none' }}>Delete</Button>
        <Button size="small" color="primary" onClick={onTimeline} sx={{ fontSize: '13px', ml: 'auto', textTransform: 'none' }}>📅 Timeline</Button>
      </CardActions>
    </Card>
  );
}
