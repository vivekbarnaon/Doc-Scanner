import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ApiStatus from './components/ApiStatus';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
              `,
              pointerEvents: 'none',
            },
          }}>
            <Header />
            <Box sx={{ paddingTop: '70px' }}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <LoginPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Box>
            <Footer />

            {/* API Status - Only visible in development */}
            <ApiStatus />
          </Box>
        </ThemeProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
