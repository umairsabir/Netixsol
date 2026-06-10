'use client';

import {
  List, ListItem, ListItemButton, ListItemText, ListItemIcon,
  Typography, Paper, Chip, Box, Button, IconButton, Tooltip
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetDocumentsQuery, useDeleteDocumentMutation } from '../../lib/redux/apiSlice';

interface DocumentListProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function DocumentList({ selectedId, onSelect }: DocumentListProps) {
  const { data: documents, isLoading, isError, error, refetch } = useGetDocumentsQuery();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id).unwrap();
        if (selectedId === id) {
          onSelect(null);
        }
      } catch (err) {
        console.error('Failed to delete document:', err);
      }
    }
  };

  if (isError) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>Failed to load documents</Typography>
        <Button size="small" variant="outlined" onClick={() => refetch()}>Retry</Button>
      </Box>
    );
  }

  if (isLoading) return <Typography sx={{ p: 2 }}>Loading documents...</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ px: 1 }}>Documents</Typography>
      <List sx={{ width: '100%' }}>
        {documents?.map((doc: any) => (
          <ListItem
            key={doc._id}
            disablePadding
            sx={{ mb: 1 }}
            secondaryAction={
              <Tooltip title="Delete document">
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => handleDelete(e, doc._id)}
                  disabled={isDeleting}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemButton
              selected={selectedId === doc._id}
              onClick={() => onSelect(doc._id)}
              sx={{
                borderRadius: 2,
                pr: 5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  borderLeft: '4px solid #6366f1',
                },
              }}
            >
              <ListItemIcon>
                <PictureAsPdfIcon color={selectedId === doc._id ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText
                primary={doc.filename}
                secondary={new Date(doc.createdAt).toLocaleDateString()}
                slotProps={{
                  primary: { noWrap: true, sx: { fontWeight: 600 } }
                }}
              />
              <Box>
                {doc.status === 'ready' && <CheckCircleIcon color="success" fontSize="small" />}
                {doc.status === 'processing' && <PendingIcon color="warning" fontSize="small" />}
                {doc.status === 'error' && <ErrorIcon color="error" fontSize="small" />}
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
        {(!documents || documents.length === 0) && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No documents uploaded yet.
          </Typography>
        )}
      </List>
    </Box>
  );
}
