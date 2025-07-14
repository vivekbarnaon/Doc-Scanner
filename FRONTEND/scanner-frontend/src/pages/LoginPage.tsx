import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Avatar,
  Divider,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Google as GoogleIcon,
  LockOutlined,
  Security,
  VerifiedUser,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      // Navigation will happen automatically due to useEffect above
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '80vh',
          justifyContent: 'center',
        }}
      >
        {/* Login Card */}
        <Card
          sx={{
            width: '100%',
            maxWidth: 450,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  width: 60,
                  height: 60,
                }}
              >
                <LockOutlined sx={{ fontSize: 30 }} />
              </Avatar>
              
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Welcome Back
              </Typography>
              
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: '1.1rem' }}
              >
                Sign in to access your DocScan account
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Google Login Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
              sx={{
                py: 1.5,
                mb: 3,
                borderColor: '#dadce0',
                color: '#3c4043',
                backgroundColor: '#fff',
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                  borderColor: '#dadce0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                },
                '&:active': {
                  backgroundColor: '#f1f3f4',
                },
                '&:disabled': {
                  backgroundColor: '#f8f9fa',
                  color: '#5f6368',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Alternative Login Options */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Other sign-in options coming soon
              </Typography>
              
              <Button
                fullWidth
                variant="contained"
                disabled
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Email & Password (Coming Soon)
              </Button>
            </Box>

            {/* Security Features */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'rgba(103, 126, 234, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(103, 126, 234, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Security sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                  Secure Authentication
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <VerifiedUser sx={{ color: 'text.secondary', mr: 1, fontSize: 16, mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary">
                  Your data is protected with industry-standard encryption
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <GoogleIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 16, mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary">
                  Powered by Google's secure OAuth 2.0 protocol
                </Typography>
              </Box>
            </Paper>

            {/* Terms and Privacy */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 3,
                lineHeight: 1.4,
              }}
            >
              By signing in, you agree to our{' '}
              <Typography
                component="span"
                variant="caption"
                color="primary.main"
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              >
                Terms of Service
              </Typography>{' '}
              and{' '}
              <Typography
                component="span"
                variant="caption"
                color="primary.main"
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              >
                Privacy Policy
              </Typography>
            </Typography>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
            New to DocScan? Your account will be created automatically upon first sign-in.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
