import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './UserProfile';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Home,
  AutoAwesome,
  History,
  Login,
} from '@mui/icons-material';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const isAuthenticated = !!currentUser;

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleFeaturesClick = () => {
    navigate('/features');
  };

  const handleHistoryClick = () => {
    navigate('/history');
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setProfileOpen(true);
    } else {
      navigate('/login');
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ minHeight: '70px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h4"
            component="div"
            onClick={handleLogoClick}
            sx={{
              fontWeight: 900,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.8rem',
              letterSpacing: '-0.5px',
              fontFamily: '"Inter", "Roboto", sans-serif',
              cursor: 'pointer',
              mr: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                filter: 'brightness(1.2)',
              },
            }}
          >
            DocScan
          </Typography>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={handleLogoClick}
              startIcon={<Home />}
              sx={{
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '12px',
                padding: '8px 16px',
                backgroundColor: location.pathname === '/' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              Home
            </Button>

            {/* Show Features and History only when authenticated */}
            {isAuthenticated && (
              <>
                <Button
                  onClick={handleFeaturesClick}
                  startIcon={<AutoAwesome />}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '12px',
                    padding: '8px 16px',
                    backgroundColor: location.pathname === '/features' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  Features
                </Button>
                <Button
                  onClick={handleHistoryClick}
                  startIcon={<History />}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '12px',
                    padding: '8px 16px',
                    backgroundColor: location.pathname === '/history' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  History
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Profile Section */}
        <Box sx={{ ml: 2 }}>
          <Tooltip title={isAuthenticated ? "Profile" : "Sign In"}>
            <IconButton
              onClick={handleProfileClick}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '8px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              {isAuthenticated && currentUser ? (
                <Avatar
                  src={currentUser.photoURL || undefined}
                  alt={currentUser.displayName || 'User'}
                  sx={{ width: 32, height: 32 }}
                >
                  {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0)}
                </Avatar>
              ) : (
                <Login sx={{ fontSize: 24 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* User Profile Dialog */}
      <UserProfile
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </AppBar>
  );
};

export default Header;
