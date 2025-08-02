import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import {
  AutoAwesome,
  Speed,
  Security,
  CloudUpload,
  Analytics,
  Devices,
} from '@mui/icons-material';

const features = [
  {
    icon: <AutoAwesome />,
    title: 'AI-Powered Processing',
    description: 'Advanced machine learning algorithms for accurate table extraction',
    color: '#ff6b6b',
    stats: '99.9% Accuracy',
  },
  {
    icon: <Speed />,
    title: 'Lightning Fast',
    description: 'Process documents in seconds with optimized performance',
    color: '#4ecdc4',
    stats: '<5s Processing',
  },
  {
    icon: <Security />,
    title: 'Secure & Private',
    description: 'Your data is processed securely and never stored permanently',
    color: '#45b7d1',
    stats: 'Bank-level Security',
  },
  {
    icon: <CloudUpload />,
    title: 'Multiple Formats',
    description: 'Support for images, PDFs, and CSV files with smart detection',
    color: '#96ceb4',
    stats: '10+ File Types',
  },
  {
    icon: <Analytics />,
    title: 'Smart Analytics',
    description: 'Intelligent data analysis and automatic column mapping',
    color: '#feca57',
    stats: 'Real-time Insights',
  },
  {
    icon: <Devices />,
    title: 'Cross-Platform',
    description: 'Works seamlessly across desktop, tablet, and mobile devices',
    color: '#ff9ff3',
    stats: 'All Devices',
  },
];

const FeatureShowcase: React.FC = () => {
  return (
    <Box sx={{ py: 6 }}>
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          mb: 6,
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom
          sx={{ 
            color: 'white',
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ✨ Powerful Features
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Discover what makes our document processing platform exceptional
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} lg={4} key={index} component="div">
            <Card
              sx={{
                height: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(15px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                },
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    backgroundColor: feature.color,
                    mb: 2,
                    mx: 'auto',
                    boxShadow: `0 8px 20px ${feature.color}40`,
                  }}
                >
                  {feature.icon}
                </Avatar>

                <Typography 
                  variant="h6" 
                  component="h3" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mb: 2,
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                  }}
                >
                  {feature.description}
                </Typography>

                <Chip
                  label={feature.stats}
                  size="small"
                  sx={{
                    backgroundColor: `${feature.color}20`,
                    color: feature.color,
                    fontWeight: 600,
                    border: `1px solid ${feature.color}40`,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeatureShowcase;
