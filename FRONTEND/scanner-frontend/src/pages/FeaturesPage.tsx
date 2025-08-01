import React, { useState } from 'react';
import {
  Box,
  Container,
  Alert,
  Snackbar,
} from '@mui/material';
import FileProcessor from '../components/FileProcessor';
import FeatureShowcase from '../components/FeatureShowcase';
import { ProcessingType, ProcessingResult } from '../types/types';

const FeaturesPage: React.FC = () => {
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleProcessingStart = (type: ProcessingType) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setError(null);
  };

  const handleProcessingComplete = (type: ProcessingType, result: ProcessingResult) => {
    setLoading(prev => ({ ...prev, [type]: false }));
    setResults(prev => [result, ...prev]);
    setSuccess(`${type} processing completed successfully!`);

    // Save to localStorage for history
    const savedHistory = localStorage.getItem('processing_history');
    let history: ProcessingResult[] = [];
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }

    // Add new result to history
    const updatedHistory = [result, ...history];
    localStorage.setItem('processing_history', JSON.stringify(updatedHistory));
  };

  const handleProcessingError = (type: ProcessingType, errorMessage: string) => {
    setLoading(prev => ({ ...prev, [type]: false }));
    setError(`${type} processing failed: ${errorMessage}`);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <FileProcessor
          results={results}
          loading={loading}
          onProcessingStart={handleProcessingStart}
          onProcessingComplete={handleProcessingComplete}
          onProcessingError={handleProcessingError}
        />

        {/* Feature Showcase - only show when no results */}
        {results.length === 0 && (
          <FeatureShowcase />
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default FeaturesPage;
