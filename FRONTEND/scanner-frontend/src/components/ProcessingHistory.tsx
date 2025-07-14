import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Download,
  Visibility,
  Close,
  FileDownload,
  Schedule,
  CheckCircle,
  Error,
  Delete,
  History as HistoryIcon,
} from '@mui/icons-material';
import { ProcessingResult } from '../types/types';

interface ProcessingHistoryProps {
  results: ProcessingResult[];
  onClearHistory?: () => void;
}

const ProcessingHistory: React.FC<ProcessingHistoryProps> = ({ 
  results, 
  onClearHistory 
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ProcessingResult | null>(null);
  const [localResults, setLocalResults] = useState<ProcessingResult[]>([]);

  useEffect(() => {
    // Load history from localStorage on component mount
    const savedHistory = localStorage.getItem('processing_history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setLocalResults(parsedHistory);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Combine current results with saved history
    const combinedResults = [...results, ...localResults];
    const uniqueResults = combinedResults.filter((result, index, self) => 
      index === self.findIndex(r => r.id === result.id)
    );
    
    // Save to localStorage
    localStorage.setItem('processing_history', JSON.stringify(uniqueResults));
    setLocalResults(uniqueResults);
  }, [results]);

  const handlePreview = (result: ProcessingResult) => {
    setSelectedResult(result);
    setPreviewOpen(true);
  };

  const handleDownload = (result: ProcessingResult) => {
    if (result.downloadUrl) {
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `${result.type}_${result.fileName.split('.')[0]}_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('processing_history');
    setLocalResults([]);
    if (onClearHistory) {
      onClearHistory();
    }
  };

  const parseCSVForPreview = (csvContent: string) => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, '')) || [];
    const rows = lines.slice(1, 11).map(line => // Show only first 10 rows
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );
    return { headers, rows };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      default:
        return <Schedule />;
    }
  };

  const allResults = [...results, ...localResults].filter((result, index, self) => 
    index === self.findIndex(r => r.id === result.id)
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          mb: 4,
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <HistoryIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: 'white',
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Processing History
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.1rem',
            mb: 2,
          }}
        >
          View and manage your processed files
        </Typography>
        
        {allResults.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<Delete />}
            onClick={handleClearHistory}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Clear History
          </Button>
        )}
      </Box>

      {/* Results */}
      {allResults.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' },
          }}
        >
          No processing history found. Start by uploading and processing some files!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {allResults.map((result) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={result.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(15px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      icon={getStatusIcon(result.status)}
                      label={result.type.toUpperCase()}
                      color={getStatusColor(result.status) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(result.timestamp).toLocaleString()}
                    </Typography>
                  </Box>

                  <Typography variant="h6" component="h3" gutterBottom noWrap>
                    {result.fileName}
                  </Typography>

                  {result.status === 'error' && result.errorMessage && (
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                      {result.errorMessage}
                    </Typography>
                  )}

                  {result.status === 'success' && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      CSV data extracted successfully
                    </Typography>
                  )}
                </CardContent>

                {result.status === 'success' && (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handlePreview(result)}
                          size="small"
                        >
                          Preview
                        </Button>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Download />}
                          onClick={() => handleDownload(result)}
                          size="small"
                        >
                          Download
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">
              CSV Preview: {selectedResult?.fileName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Showing first 10 rows
            </Typography>
          </Box>
          <IconButton onClick={() => setPreviewOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedResult && (
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {parseCSVForPreview(selectedResult.csvContent).headers.map((header, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parseCSVForPreview(selectedResult.csvContent).rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex} hover>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
          {selectedResult && (
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={() => {
                handleDownload(selectedResult);
                setPreviewOpen(false);
              }}
            >
              Download CSV
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessingHistory;
