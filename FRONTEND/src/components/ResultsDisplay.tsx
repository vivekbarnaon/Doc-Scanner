import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { ProcessingResult } from '../types/types';

const getStatusColor = (status: string) => status === 'success' ? 'success' : 'error';
const getStatusIcon = (status: string) => status === 'success' ? <CheckCircle /> : <Error />;

interface ResultsDisplayProps {
  results: ProcessingResult[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ProcessingResult | null>(null);
  const [previewContent, setPreviewContent] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

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
      console.error('Error fetching CSV preview:', error);
      setPreviewError(error.message || 'Failed to load preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = (result: ProcessingResult) => {
    if (result.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
    }
  };

  return (
    <Box>
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          mb: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h2" sx={{ color: 'white', fontWeight: 700 }}>
          Processing Results
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {results.map((result) => (
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

export default ResultsDisplay;