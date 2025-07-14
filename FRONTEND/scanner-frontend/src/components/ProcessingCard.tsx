import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Image,
  PictureAsPdf,
  MergeType,
  CloudUpload,
  CheckCircle,
} from '@mui/icons-material';
import { ProcessingCardProps, ProcessingResult } from '../types/types';
import { processFile } from '../services/api';

const ProcessingCard: React.FC<ProcessingCardProps> = ({
  type,
  title,
  description,
  icon,
  acceptedFiles,
  loading,
  multipleFiles = false,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    onProcessingStart(type);

    try {
      let result: ProcessingResult;
      
      if (multipleFiles && acceptedFiles.length >= 2) {
        // For merge CSV, we need at least 2 files
        result = await processFile(type, acceptedFiles);
      } else {
        // For single file processing
        result = await processFile(type, [acceptedFiles[0]]);
      }

      onProcessingComplete(type, result);
    } catch (error: any) {
      onProcessingError(type, error.message || 'Processing failed');
    }
  }, [type, multipleFiles, onProcessingStart, onProcessingComplete, onProcessingError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFiles.split(',').reduce((acc, ext) => {
      acc[`*/${ext.replace('.', '')}`] = [ext];
      return acc;
    }, {} as Record<string, string[]>),
    multiple: multipleFiles,
    disabled: loading,
  });

  const getIcon = () => {
    const iconStyle = {
      fontSize: 56,
      background: icon === 'image'
        ? 'linear-gradient(45deg, #1976d2, #42a5f5)' :
        icon === 'pdf'
        ? 'linear-gradient(45deg, #f44336, #ff8a80)' :
        'linear-gradient(45deg, #4caf50, #81c784)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
    };

    switch (icon) {
      case 'image':
        return <Image sx={iconStyle} />;
      case 'pdf':
        return <PictureAsPdf sx={iconStyle} />;
      case 'merge':
        return <MergeType sx={iconStyle} />;
      default:
        return <CloudUpload sx={iconStyle} />;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: `linear-gradient(135deg,
          rgba(255, 255, 255, 0.25) 0%,
          rgba(255, 255, 255, 0.15) 50%,
          rgba(255, 255, 255, 0.1) 100%
        )`,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          transform: 'translateY(-12px) scale(1.02)',
          background: `linear-gradient(135deg,
            rgba(255, 255, 255, 0.35) 0%,
            rgba(255, 255, 255, 0.25) 50%,
            rgba(255, 255, 255, 0.15) 100%
          )`,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(25px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg,
            rgba(102, 126, 234, 0.1) 0%,
            rgba(118, 75, 162, 0.05) 50%,
            rgba(240, 147, 251, 0.1) 100%
          )`,
          borderRadius: '24px',
          zIndex: -1,
        },
      }}
    >
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
          }}
        />
      )}
      
      <Box
        {...getRootProps()}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 0,
        }}
      >
        <input {...getInputProps()} />
        
        <CardContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            p: 3,
            '&:last-child': { pb: 3 },
          }}
        >
          <Box
            sx={{
              mb: 3,
              p: 3,
              borderRadius: '20px',
              background: `linear-gradient(135deg,
                ${icon === 'image'
                  ? 'rgba(25, 118, 210, 0.15) 0%, rgba(66, 165, 245, 0.1) 100%' :
                  icon === 'pdf'
                  ? 'rgba(244, 67, 54, 0.15) 0%, rgba(255, 138, 128, 0.1) 100%' :
                  'rgba(76, 175, 80, 0.15) 0%, rgba(129, 199, 132, 0.1) 100%'
                }
              )`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${
                icon === 'image'
                  ? 'rgba(25, 118, 210, 0.2)' :
                  icon === 'pdf'
                  ? 'rgba(244, 67, 54, 0.2)' :
                  'rgba(76, 175, 80, 0.2)'
              }`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at center,
                  ${icon === 'image'
                    ? 'rgba(25, 118, 210, 0.1)' :
                    icon === 'pdf'
                    ? 'rgba(244, 67, 54, 0.1)' :
                    'rgba(76, 175, 80, 0.1)'
                  } 0%,
                  transparent 70%
                )`,
                borderRadius: '20px',
                zIndex: -1,
              },
            }}
          >
            {getIcon()}
          </Box>

          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: `linear-gradient(45deg,
                ${icon === 'image'
                  ? '#1976d2, #42a5f5, #90caf9' :
                  icon === 'pdf'
                  ? '#f44336, #ff8a80, #ffab91' :
                  '#4caf50, #81c784, #a5d6a7'
                }
              )`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              fontSize: '1.3rem',
              letterSpacing: '-0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              lineHeight: 1.6,
              textAlign: 'center',
              fontSize: '0.9rem',
            }}
          >
            {description}
          </Typography>
          
          <Box sx={{ mt: 'auto', width: '100%' }}>
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="primary">
                  Processing...
                </Typography>
              </Box>
            ) : (
              <Button
                variant={isDragActive ? "contained" : "outlined"}
                fullWidth
                startIcon={isDragActive ? <CheckCircle /> : <CloudUpload />}
                sx={{
                  py: 2.5,
                  borderStyle: isDragActive ? 'solid' : 'dashed',
                  borderWidth: 2,
                  borderRadius: '16px',
                  background: isDragActive
                    ? `linear-gradient(135deg,
                        ${icon === 'image'
                          ? '#1976d2, #42a5f5' :
                          icon === 'pdf'
                          ? '#f44336, #ff8a80' :
                          '#4caf50, #81c784'
                        }
                      )`
                    : `linear-gradient(135deg,
                        rgba(255, 255, 255, 0.2) 0%,
                        rgba(255, 255, 255, 0.1) 100%
                      )`,
                  backdropFilter: 'blur(10px)',
                  border: isDragActive
                    ? 'none'
                    : `2px dashed ${
                        icon === 'image'
                          ? 'rgba(25, 118, 210, 0.4)' :
                          icon === 'pdf'
                          ? 'rgba(244, 67, 54, 0.4)' :
                          'rgba(76, 175, 80, 0.4)'
                      }`,
                  color: isDragActive ? 'white' : 'inherit',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: isDragActive
                    ? '0 8px 32px rgba(0, 0, 0, 0.2)'
                    : '0 4px 16px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    background: isDragActive
                      ? `linear-gradient(135deg,
                          ${icon === 'image'
                            ? '#1565c0, #1976d2' :
                            icon === 'pdf'
                            ? '#d32f2f, #f44336' :
                            '#388e3c, #4caf50'
                          }
                        )`
                      : `linear-gradient(135deg,
                          rgba(255, 255, 255, 0.3) 0%,
                          rgba(255, 255, 255, 0.15) 100%
                        )`,
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: isDragActive
                      ? '0 12px 40px rgba(0, 0, 0, 0.3)'
                      : '0 8px 24px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(15px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {isDragActive
                  ? '📁 Drop files here'
                  : multipleFiles
                  ? '📤 Upload Multiple Files'
                  : '📤 Upload File'
                }
              </Button>
            )}
            
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ mt: 1, display: 'block' }}
            >
              Supported: {acceptedFiles}
              {multipleFiles && ' (Multiple files)'}
            </Typography>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default ProcessingCard;
