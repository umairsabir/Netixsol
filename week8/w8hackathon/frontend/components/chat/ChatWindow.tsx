'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, TextField, IconButton, CircularProgress, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { useChatWithDocumentMutation } from '../../lib/redux/apiSlice';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
}

export default function ChatWindow({ id }: { id: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatWithDocument, { isLoading }] = useChatWithDocumentMutation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await chatWithDocument({ id, message: input }).unwrap();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.finalOutput || 'Error processing response',
        agent: response.agent?.name // Optional agent info if available
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
  };

  return (
    <Paper sx={{ 
      height: '600px', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.paper',
      overflow: 'hidden'
    }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Ask Documents</Typography>
        <Typography variant="caption" color="text.secondary">Powered by Multi-Agent System</Typography>
      </Box>

      <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map((msg, i) => (
          <Box key={i} sx={{ 
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            display: 'flex',
            gap: 1,
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
          }}>
            <Avatar sx={{ 
              bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
              width: 32,
              height: 32
            }}>
              {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
            </Avatar>
            <Box sx={{ maxWidth: 'calc(100% - 40px)' }}>
              <Paper sx={{ 
                p: 1.5, 
                px: 2, 
                bgcolor: msg.role === 'user' ? 'primary.main' : 'rgba(255,255,255,0.05)',
                borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                '& .markdown': {
                  fontSize: '0.875rem',
                  '& p': { m: 0, mb: 1 },
                  '& p:last-child': { mb: 0 },
                  '& ul, & ol': { pl: 2, m: 0, mb: 1 },
                  '& li': { mb: 0.5 },
                  '& h1, & h2, & h3': { fontSize: '1rem', m: 0, mb: 1, color: msg.role === 'user' ? 'inherit' : 'primary.main' },
                  '& code': { bgcolor: 'rgba(0,0,0,0.2)', p: 0.5, borderRadius: 1 }
                }
              }}>
                {msg.role === 'assistant' ? (
                  <Box className="markdown">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </Box>
                ) : (
                  <Typography variant="body2">{msg.content}</Typography>
                )}
              </Paper>
              {msg.agent && (
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', px: 1, color: 'text.secondary' }}>
                  Agent: {msg.agent}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">Agents are thinking...</Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 10 } }}
          />
          <IconButton color="primary" onClick={handleSend} disabled={isLoading}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
