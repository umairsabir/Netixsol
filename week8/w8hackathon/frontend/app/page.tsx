'use client';

import { useState } from 'react';
import { Container, Grid, Box, Typography, Divider } from '@mui/material';
import Navbar from '../components/layout/Navbar';
import UploadZone from '../components/document/UploadZone';
import DocumentList from '../components/document/DocumentList';
import AnalysisView from '../components/document/AnalysisView';
import ChatWindow from '../components/chat/ChatWindow';

export default function Home() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Grid container spacing={4}>
          {/* Left Column: Sidebar and Upload */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <UploadZone />
              <Divider sx={{ opacity: 0.1 }} />
              <DocumentList selectedId={selectedDocId} onSelect={setSelectedDocId} />
            </Box>
          </Grid>

          {/* Right Column: Content */}
          <Grid size={{ xs: 12, md: 9 }}>
            {selectedDocId ? (
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, lg: 7 }}>
                  <AnalysisView id={selectedDocId} />
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                  <ChatWindow id={selectedDocId} />
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ 
                height: '70vh', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                textAlign: 'center',
                opacity: 0.5
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
                  Select a document to begin analysis
                </Typography>
                <Typography variant="body1">
                  Upload a PDF and let our AI agents extract intelligence for you.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
