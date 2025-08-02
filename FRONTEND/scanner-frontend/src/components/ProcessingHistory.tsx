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
  CircularProgress,
} from '@mui/material';
import {
  Download,
  Visibility,
  Close,
  FileDownload,
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

const ProcessingHistory: React.FC<ProcessingHistoryProps> = ({ results, onClearHistory }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ProcessingResult | null>(null);
  const [localResults, setLocalResults] = useState<ProcessingResult[]>([]);
  const [previewContent, setPreviewContent] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('processing_history');
    if (savedHistory) {
      try {
        setLocalResults(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (results.length > 0) {
        const combinedResults = [...results, ...localResults];
        const uniqueResults = combinedResults.filter((result, index, self) => 
            index === self.findIndex(r => r.id === result.id)
        );
        localStorage.setItem('processing_history', JSON.stringify(uniqueResults));
        setLocalResults(uniqueResults);
    }
  }, [results, localResults]);

  const parseCSVForPreview = (csvContent: string): { headers: string[]; rows: string[][] } => {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '')) || [];
    const rows = lines.slice(1, 11).map(line =>
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );
    return { headers, rows };
  };

  const handlePreview = async (result: ProcessingResult) => {
    if (!result.downloadUrl) {
      setPreviewError('Download URL not available.');
      return;
    }

    setSelectedResult(result);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewContent(null);

    try {
      const response = await fetch(result.downloadUrl);
      if (!response.ok) {
        throw new globalThis.Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      const parsedData = parseCSVForPreview(csvText);
      setPreviewContent(parsedData);
    } catch (error: any) {
      console.error("Failed to fetch preview content:", error);
      setPreviewError("Could not load preview data.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = (result: ProcessingResult) => {
    if (result.downloadUrl && result.fileName) {
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      const baseName = result.fileName.substring(0, result.fileName.lastIndexOf('.')) || result.fileName;
      link.download = `${result.type}_${baseName}_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClearHistoryLocal = () => {
    localStorage.removeItem('processing_history');
    setLocalResults([]);
    if (onClearHistory) {
      onClearHistory();
    }
  };

  const getStatusColor = (status: string) => status === 'success' ? 'success' : 'error';
  const getStatusIcon = (status: string) => status === 'success' ? <CheckCircle /> : <Error />;
  
  const allResults = [...localResults].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
          <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }}/> Processing History
        </Typography>
        {allResults.length > 0 && (
          <Button variant="outlined" startIcon={<Delete />} onClick={handleClearHistoryLocal} sx={{ mt: 2 }}>
            Clear History
          </Button>
        )}
      </Box>

      {allResults.length === 0 ? (
        <Alert severity="info">No processing history found.</Alert>
      ) : (
        <Grid container spacing={3}>
          {allResults.map((result) => (
            <Grid item xs={12} md={6} lg={4} key={result.id} component="div">
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      icon={getStatusIcon(result.status)}
                      label={result.type.toUpperCase()}
                      color={getStatusColor(result.status)}
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
                  {result.status === 'error' && (
                    <Typography variant="body2" color="error">{result.errorMessage}</Typography>
                  )}
                </CardContent>
                {result.status === 'success' && (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6} component="div">
                        <Button fullWidth variant="outlined" startIcon={<Visibility />} onClick={() => handlePreview(result)} size="small">
                          Preview
                        </Button>
                      </Grid>
                      <Grid item xs={6} component="div">
                        <Button fullWidth variant="contained" startIcon={<Download />} onClick={() => handleDownload(result)} size="small">
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

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">CSV Preview: {selectedResult?.fileName}</Typography>
            <Typography variant="caption" color="text.secondary">Showing first 10 rows</Typography>
          </Box>
          <IconButton onClick={() => setPreviewOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {previewLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
          {previewError && <Alert severity="error">{previewError}</Alert>}
          {previewContent && !previewLoading && (
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {previewContent.headers.map((header, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold' }}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewContent.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex} hover>
                      {row.map((cell, cellIndex) => (<TableCell key={cellIndex}>{cell}</TableCell>))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          {selectedResult && (
            <Button variant="contained" startIcon={<FileDownload />} onClick={() => handleDownload(selectedResult)}>
              Download CSV
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessingHistory;