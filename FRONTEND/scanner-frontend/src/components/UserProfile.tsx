import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Email,
  Person,
  CalendarToday,
  Logout,
  Security,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  open: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ open, onClose }) => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      onClose();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" fontWeight={600}>
          User Profile
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {/* User Avatar and Basic Info */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            src={currentUser.photoURL || undefined}
            alt={currentUser.displayName || 'User'}
            sx={{
              width: 100,
              height: 100,
              mx: 'auto',
              mb: 2,
              border: '4px solid',
              borderColor: 'primary.main',
            }}
          >
            {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0)}
          </Avatar>

          <Typography variant="h6" fontWeight={600} gutterBottom>
            {currentUser.displayName || 'User'}
          </Typography>

          <Chip
            label="Verified Account"
            color="success"
            size="small"
            icon={<Security />}
            sx={{ mb: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* User Details */}
        <List sx={{ py: 0 }}>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <Person color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Display Name"
              secondary={currentUser.displayName || 'Not set'}
            />
          </ListItem>

          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <Email color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Email Address"
              secondary={currentUser.email || 'Not available'}
            />
          </ListItem>

          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <CalendarToday color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Account Created"
              secondary={formatDate(currentUser.metadata.creationTime || null)}
            />
          </ListItem>

          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <CalendarToday color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Last Sign In"
              secondary={formatDate(currentUser.metadata.lastSignInTime || null)}
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 3 }} />

        {/* Account Actions */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
            }}
            disabled
          >
            Account Settings (Coming Soon)
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
            disabled={loading}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            {loading ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfile;
