import React from 'react';
import {
  Box,
  Grid,
  Typography,
} from '@mui/material';
import ProcessingCard from './ProcessingCard';
import ResultsDisplay from './ResultsDisplay';
import { ProcessingType, ProcessingResult } from '../types/types';

interface FileProcessorProps {
  results: ProcessingResult[];
  loading: { [key: string]: boolean };
  onProcessingStart: (type: ProcessingType) => void;
  onProcessingComplete: (type: ProcessingType, result: ProcessingResult) => void;
  onProcessingError: (type: ProcessingType, error: string) => void;
}

const FileProcessor: React.FC<FileProcessorProps> = ({
  results,
  loading,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
}) => {

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(15px)',
            borderRadius: '24px',
            padding: '3rem 2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: 800,
            mx: 'auto',
            mb: 4,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              color: 'white',
              fontWeight: 800,
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              mb: 3,
              background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Transform Your Documents
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: '1.2rem',
              fontWeight: 400,
            }}
          >
            Upload images, PDFs, or CSV files and let our powerful AI extract, process, and merge your data seamlessly with cutting-edge technology
          </Typography>
        </Box>

        {/* Feature Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          {[
            { icon: '🖼️', label: 'Image Processing', count: '99.9%' },
            { icon: '📄', label: 'PDF Extraction', count: '100+' },
            { icon: '🔄', label: 'CSV Merging', count: 'Smart' },
          ].map((stat, index) => (
            <Box
              key={index}
              sx={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '1rem 1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
                minWidth: 120,
              }}
            >
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {stat.icon}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                }}
              >
                {stat.count}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.85rem',
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Processing Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4} component="div">
          <ProcessingCard
            type="imgtocsv"
            title="Image to CSV"
            description="Extract tables from images using AI"
            icon="image"
            acceptedFiles=".jpg,.jpeg,.png,.bmp,.gif"
            loading={loading.imgtocsv || false}
            onProcessingStart={onProcessingStart}
            onProcessingComplete={onProcessingComplete}
            onProcessingError={onProcessingError}
          />
        </Grid>

        <Grid item xs={12} md={4} component="div">
          <ProcessingCard
            type="pdfcsv"
            title="PDF to CSV"
            description="Convert PDF tables to CSV format"
            icon="pdf"
            acceptedFiles=".pdf"
            loading={loading.pdfcsv || false}
            onProcessingStart={onProcessingStart}
            onProcessingComplete={onProcessingComplete}
            onProcessingError={onProcessingError}
          />
        </Grid>

        <Grid item xs={12} md={4} component="div">
          <ProcessingCard
            type="mergecsv"
            title="Merge CSV"
            description="Intelligently merge CSV files"
            icon="merge"
            acceptedFiles=".csv"
            loading={loading.mergecsv || false}
            onProcessingStart={onProcessingStart}
            onProcessingComplete={onProcessingComplete}
            onProcessingError={onProcessingError}
            multipleFiles={true}
          />
        </Grid>
      </Grid>

      {/* Results Section */}
      {results.length > 0 && (
        <ResultsDisplay results={results} />
      )}
    </Box>
  );
};

export default FileProcessor;
