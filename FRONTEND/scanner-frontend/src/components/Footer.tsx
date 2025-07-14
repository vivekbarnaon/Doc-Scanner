import React from 'react';
import {
  Box,
  Typography,
  Container,
} from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        mt: 8,
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
            }}
          >
            © 2024 DocuScan. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
