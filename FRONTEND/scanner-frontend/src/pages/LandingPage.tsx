import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import {
  AutoAwesome,
  Speed,
  Security,
  CloudUpload,
  Analytics,
  Download,
  Verified,
  TrendingUp,
  Star,
  History as HistoryIcon,
} from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [animatedText, setAnimatedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const isAuthenticated = !!currentUser;
  const fullText = isAuthenticated
    ? `Welcome back, ${currentUser?.displayName || 'User'}! 🎉`
    : 'Transform Documents with AI Magic ✨';

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setAnimatedText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/features');
    } else {
      navigate('/login');
    }
  };

  const highlights = [
    {
      icon: <AutoAwesome />,
      title: 'AI-Powered',
      description: '99.9% accuracy with advanced machine learning',
      color: '#ff6b6b',
      badge: 'NEW',
    },
    {
      icon: <Speed />,
      title: 'Lightning Fast',
      description: 'Process documents in under 5 seconds',
      color: '#4ecdc4',
      badge: 'FAST',
    },
    {
      icon: <Security />,
      title: 'Secure & Private',
      description: 'Bank-level security for your data',
      color: '#45b7d1',
      badge: 'SECURE',
    },
  ];

  const features = isAuthenticated ? [
    { icon: <CloudUpload />, text: 'Upload Documents' },
    { icon: <Analytics />, text: 'AI Processing' },
    { icon: <Download />, text: 'Export Results' },
    { icon: <Verified />, text: 'Full Access' },
  ] : [
    { icon: <CloudUpload />, text: 'Upload Any Format' },
    { icon: <Analytics />, text: 'Smart Processing' },
    { icon: <Download />, text: 'Instant Download' },
    { icon: <Security />, text: 'Sign In Required' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 8 }}>
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          {/* Main Hero Content */}
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '32px',
              padding: { xs: '3rem 2rem', md: '4rem 3rem' },
              border: '1px solid rgba(255, 255, 255, 0.2)',
              mb: 6,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.2) 0%, transparent 50%),
                  radial-gradient(circle at 70% 80%, rgba(255, 119, 198, 0.2) 0%, transparent 50%)
                `,
                pointerEvents: 'none',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {/* Logo/Icon */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                }}
              >
                DS
              </Box>

              {/* Main Title */}
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  color: 'white',
                  fontWeight: 900,
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  mb: 3,
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                  lineHeight: 1.1,
                }}
              >
                DocuScan
              </Typography>

              {/* Animated Subtitle */}
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontWeight: 600,
                  mb: 4,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  lineHeight: 1.3,
                  minHeight: '2.5rem',
                }}
              >
                {animatedText}
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    ml: 0.5,
                    animation: 'blink 1s infinite',
                    '@keyframes blink': {
                      '0%, 50%': { opacity: 1 },
                      '51%, 100%': { opacity: 0 },
                    },
                  }}
                />
              </Typography>

              {/* Description */}
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  maxWidth: 700,
                  mx: 'auto',
                  lineHeight: 1.8,
                  mb: 4,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 400,
                }}
              >
                {isAuthenticated ? (
                  <>
                    Ready to process your documents? Access all features including table extraction,
                    CSV merging, and advanced AI-powered document analysis.
                  </>
                ) : (
                  <>
                    Extract tables from images and PDFs, merge CSV files intelligently,
                    and streamline your data processing workflow with cutting-edge AI technology.
                    <br />
                    <Typography
                      component="span"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1rem',
                        fontStyle: 'italic',
                        mt: 2,
                        display: 'block',
                      }}
                    >
                      Sign in to unlock all features and start processing your documents!
                    </Typography>
                  </>
                )}
              </Typography>

              {/* Feature Chips */}
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                flexWrap="wrap"
                sx={{ mb: 5, gap: 1 }}
              >
                {features.map((feature, index) => {
                  const isLastChip = !isAuthenticated && index === features.length - 1;
                  return (
                    <Chip
                      key={index}
                      icon={feature.icon}
                      label={feature.text}
                      variant="outlined"
                      sx={{
                        color: isLastChip ? 'rgba(255, 193, 7, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        borderColor: isLastChip ? 'rgba(255, 193, 7, 0.5)' : 'rgba(255, 255, 255, 0.3)',
                        backgroundColor: isLastChip ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          backgroundColor: isLastChip ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                          borderColor: isLastChip ? 'rgba(255, 193, 7, 0.7)' : 'rgba(255, 255, 255, 0.5)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                        '& .MuiChip-icon': {
                          color: isLastChip ? 'rgba(255, 193, 7, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                        },
                      }}
                    />
                  );
                })}
              </Stack>

              {/* Get Started Button */}
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                sx={{
                  fontSize: { xs: '1.2rem', md: '1.4rem' },
                  padding: { xs: '12px 32px', md: '16px 48px' },
                  borderRadius: '50px',
                  background: isAuthenticated
                    ? 'linear-gradient(45deg, #4caf50, #45a049)'
                    : 'linear-gradient(45deg, #667eea, #764ba2)',
                  boxShadow: isAuthenticated
                    ? '0 8px 32px rgba(76, 175, 80, 0.4)'
                    : '0 8px 32px rgba(102, 126, 234, 0.4)',
                  textTransform: 'none',
                  fontWeight: 700,
                  minWidth: 200,
                  '&:hover': {
                    background: isAuthenticated
                      ? 'linear-gradient(45deg, #45a049, #3d8b40)'
                      : 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                    transform: 'translateY(-2px)',
                    boxShadow: isAuthenticated
                      ? '0 12px 40px rgba(76, 175, 80, 0.6)'
                      : '0 12px 40px rgba(102, 126, 234, 0.6)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {isAuthenticated ? 'Start Processing' : 'Sign In to Get Started'}
              </Button>
            </Box>
          </Box>

          {/* Quick Actions for Authenticated Users */}
          {isAuthenticated && (
            <Box sx={{ mt: 6, mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  textAlign: 'center',
                  mb: 3,
                  fontWeight: 600,
                }}
              >
                Quick Actions
              </Typography>
              <Grid container spacing={3} justifyContent="center">
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/features')}
                    sx={{
                      py: 2,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      borderRadius: 3,
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <AutoAwesome sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="body2">All Features</Typography>
                    </Box>
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/history')}
                    sx={{
                      py: 2,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      borderRadius: 3,
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <HistoryIcon sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="body2">View History</Typography>
                    </Box>
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Feature Highlights */}
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {highlights.map((highlight, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  {/* Badge */}
                  <Chip
                    label={highlight.badge}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: 16,
                      background: `linear-gradient(45deg, ${highlight.color}, ${highlight.color}dd)`,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      zIndex: 1,
                      '& .MuiChip-label': {
                        px: 1.5,
                      },
                    }}
                  />

                  <CardContent sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        backgroundColor: highlight.color,
                        mb: 2,
                        mx: 'auto',
                        boxShadow: `0 8px 20px ${highlight.color}40`,
                        animation: 'float 3s ease-in-out infinite',
                        '@keyframes float': {
                          '0%, 100%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-5px)' },
                        },
                      }}
                    >
                      {highlight.icon}
                    </Avatar>
                    
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 700,
                        color: 'white',
                        mb: 1,
                      }}
                    >
                      {highlight.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        lineHeight: 1.6,
                        fontSize: '1rem',
                      }}
                    >
                      {highlight.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Stats Section */}
          <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            {[
              { number: '10K+', label: 'Documents Processed', icon: <TrendingUp /> },
              { number: '99.9%', label: 'Accuracy Rate', icon: <Star /> },
              { number: '<5s', label: 'Processing Time', icon: <Speed /> },
            ].map((stat, index) => (
              <Box
                key={index}
                sx={{
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '1.5rem 2rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  minWidth: 150,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Box sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }}>
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      color: 'white',
                      fontWeight: 800,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.number}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
