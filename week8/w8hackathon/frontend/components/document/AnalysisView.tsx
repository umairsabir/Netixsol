'use client';

import { Box, Typography, Grid, Chip, Skeleton, Card, CardContent } from '@mui/material';
import { useGetDocumentByIdQuery } from '../../lib/redux/apiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function AnalysisView({ id }: { id: string }) {
  const { data: doc, isLoading } = useGetDocumentByIdQuery(id, {
    pollingInterval: 5000,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (!doc) return null;

  if (doc.status === 'error') {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(211, 47, 47, 0.05)', borderRadius: 2, border: '1px solid rgba(211, 47, 47, 0.2)' }}>
        <Typography variant="h6" color="error" gutterBottom>Analysis Failed</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          We encountered an error while analyzing this document. This could be due to complex formatting or a temporary service issue.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try deleting and re-uploading the document, or ask specific questions in the chat.
        </Typography>
      </Box>
    );
  }

  const analysis = doc.analysis;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={doc._id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{doc.filename}</Typography>
            <Chip 
              label={analysis?.type || 'Analyzing...'} 
              color="primary" 
              variant="outlined" 
            />
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Document Type
                  </Typography>
                  <Typography variant="h6">
                    {analysis?.type || 'Determining...'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Entities Identified
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {analysis?.entities?.map((entity: string, i: number) => (
                      <Chip key={i} label={entity} size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)' }} />
                    )) || 'None yet'}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Executive Summary
              </Typography>
              <Box sx={{ 
                opacity: 0.9, 
                lineHeight: 1.7,
                '& h1, & h2, & h3': { color: 'primary.main', mt: 2, mb: 1, fontWeight: 700 },
                '& p': { mb: 2 },
                '& ul, & ol': { pl: 3, mb: 2 },
                '& li': { mb: 1 }
              }}>
                {analysis?.summary ? (
                  <ReactMarkdown>{analysis.summary}</ReactMarkdown>
                ) : (
                  <Typography variant="body1">Analyzing document content...</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Key Highlights
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {analysis?.highlights?.map((h: string, i: number) => (
                  <Typography component="li" key={i} sx={{ mb: 1, opacity: 0.8 }}>
                    {h}
                  </Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}
