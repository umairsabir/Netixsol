'use client';

import { useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useUploadDocumentMutation } from '../../lib/redux/apiSlice';
import { motion } from 'framer-motion';

export default function UploadZone() {
  const [uploadDocument, { isLoading, isError, error }] = useUploadDocumentMutation();
  const [dragging, setDragging] = useState(false);

  const handleFileChange = async (file: File) => {
    if (file && file.type === 'application/pdf') {
      const formData = new FormData();
      formData.append('file', file);
      await uploadDocument(formData);
    } else {
      alert('Please upload a PDF file.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          handleFileChange(file);
        }}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: dragging ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
          background: dragging ? 'rgba(99, 102, 241, 0.05)' : 'background.paper',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            background: 'rgba(99, 102, 241, 0.05)',
          },
        }}
      >
        <input
          accept="application/pdf"
          style={{ display: 'none' }}
          id="upload-button"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
        />
        <label htmlFor="upload-button" style={{ cursor: 'pointer', width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {isLoading ? (
              <CircularProgress size={48} />
            ) : (
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            )}
            <Box>
              <Typography variant="h6">
                {isLoading ? 'Processing Document...' : 'Upload PDF Document'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drag and drop or click to browse
              </Typography>
            </Box>
            <Button variant="contained" disabled={isLoading} component="span">
              Select File
            </Button>
            {isError && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                Upload failed: {JSON.stringify((error as any)?.data?.message || 'Unknown error')}
              </Typography>
            )}
          </Box>
        </label>
      </Paper>
    </motion.div>
  );
}
