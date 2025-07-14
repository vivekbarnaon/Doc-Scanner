import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error,
  Warning,
  Info,
  Cloud,
  Computer,
  Key,
} from '@mui/icons-material';
import { getEnvironmentInfo } from '../config/api';

const ApiStatus: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [envInfo, setEnvInfo] = useState(getEnvironmentInfo());

  useEffect(() => {
    setEnvInfo(getEnvironmentInfo());
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const getStatusColor = () => {
    if (envInfo.isProduction && envInfo.hasAzureKey) return 'success';
    if (envInfo.isLocal) return 'info';
    return 'warning';
  };

  const getStatusIcon = () => {
    if (envInfo.isProduction && envInfo.hasAzureKey) return <CheckCircle />;
    if (envInfo.isLocal) return <Computer />;
    return <Warning />;
  };

  const getStatusText = () => {
    if (envInfo.isProduction && envInfo.hasAzureKey) return 'Production Ready';
    if (envInfo.isLocal) return 'Local Development';
    if (envInfo.isProduction && !envInfo.hasAzureKey) return 'Missing Azure Key';
    return 'Configuration Needed';
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        maxWidth: 400,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={getStatusIcon()}
            label={getStatusText()}
            color={getStatusColor()}
            size="small"
          />
          <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
            API Status
          </Typography>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ ml: 'auto' }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <List dense sx={{ mt: 1 }}>
            <ListItem>
              <ListItemIcon>
                {envInfo.isProduction ? <Cloud /> : <Computer />}
              </ListItemIcon>
              <ListItemText
                primary="Environment"
                secondary={envInfo.isProduction ? 'Production' : 'Development'}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Info />
              </ListItemIcon>
              <ListItemText
                primary="API URL"
                secondary={envInfo.apiUrl}
                secondaryTypographyProps={{
                  sx: { 
                    fontSize: '0.75rem',
                    wordBreak: 'break-all',
                  }
                }}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                {envInfo.hasAzureKey ? (
                  <CheckCircle color="success" />
                ) : (
                  <Error color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Azure Function Key"
                secondary={envInfo.hasAzureKey ? 'Configured' : 'Not Set'}
              />
            </ListItem>

            {!envInfo.hasAzureKey && envInfo.isProduction && (
              <ListItem>
                <ListItemIcon>
                  <Key color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Action Required"
                  secondary="Add REACT_APP_AZURE_FUNCTION_KEY to .env"
                  secondaryTypographyProps={{
                    sx: { fontSize: '0.75rem', color: 'warning.main' }
                  }}
                />
              </ListItem>
            )}
          </List>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 1,
              p: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 1,
              fontSize: '0.7rem',
            }}
          >
            This panel is only visible in development mode
          </Typography>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default ApiStatus;
