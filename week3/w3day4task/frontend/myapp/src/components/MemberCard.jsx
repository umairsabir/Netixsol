import { Card, CardContent, Typography, Avatar, Box, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRef } from 'react';
import gsap from 'gsap';

export default function MemberCard({ member, onEdit, onDelete }) {
  const cardRef = useRef();

  const handleMouseEnter = () => gsap.to(cardRef.current, { scale: 1.03, duration: 0.25 });
  const handleMouseLeave = () => gsap.to(cardRef.current, { scale: 1, duration: 0.25 });

  return (
    <Card ref={cardRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} sx={{ textAlign: 'center', p: 1.5 }}>
       <CardContent sx={{ pb: '16px !important' }}>
         <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 1.5, bgcolor: 'primary.main', fontSize: 20 }}>
           {member.name[0].toUpperCase()}
         </Avatar>
         <Typography fontWeight={700} sx={{ fontSize: '1.1rem', mb: 0.5 }}>{member.name}</Typography>
         <Chip label={member.role} size="small" color="primary"
           sx={{ mt: 0.5, mb: 1, fontSize: '12px', height: '24px', px: 0.5 }} />
         <Typography color="text.secondary" sx={{ fontSize: '13px', display: 'block', mb: 1 }}>{member.email}</Typography>
         <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
           <IconButton size="small" onClick={() => onEdit(member)}><EditIcon sx={{ fontSize: '18px' }} /></IconButton>
           <IconButton size="small" color="error" onClick={() => onDelete(member._id)}><DeleteIcon sx={{ fontSize: '18px' }} /></IconButton>
         </Box>
       </CardContent>
     </Card>
  );
}
