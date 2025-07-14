import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  CircularProgress,
  Typography,
  Container,
} from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, requires authentication; if false, requires no authentication
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="rgba(255, 255, 255, 0.8)">
            Loading...
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" sx={{ mt: 1 }}>
            Please wait while we verify your authentication
          </Typography>
        </Box>
      </Container>
    );
  }

  // If route requires authentication but user is not authenticated
  if (requireAuth && !currentUser) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires no authentication but user is authenticated
  if (!requireAuth && currentUser) {
    // Redirect to home page or the page they were trying to access
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // User meets the route requirements
  return <>{children}</>;
};

export default ProtectedRoute;
