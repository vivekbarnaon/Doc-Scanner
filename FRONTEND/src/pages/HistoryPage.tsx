import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
} from '@mui/material';
import ProcessingHistory from '../components/ProcessingHistory';
import { ProcessingResult } from '../types/types';

const HistoryPage: React.FC = () => {
  const [results, setResults] = useState<ProcessingResult[]>([]);

  useEffect(() => {
    // Load results from localStorage
    const savedHistory = localStorage.getItem('processing_history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setResults(parsedHistory);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  const handleClearHistory = () => {
    setResults([]);
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ProcessingHistory 
          results={results} 
          onClearHistory={handleClearHistory}
        />
      </Container>
    </Box>
  );
};

export default HistoryPage;
