import * as React from 'react';
import { Box, Typography } from '@mui/material';
import logo from "../assets/energieslogo1.png";

export default function CompanyHeader() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        paddingY: 1.5,
        paddingX: 2,
       
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="Sri Lanka Energies Logo"
        sx={{
          width: 36,
          height: 36,
          
          marginRight: 1.5, // Reduced space between image and text
        }}
      />
      <Typography
        variant="h6"
        noWrap
        sx={{
          fontWeight: 600,
          color: '#120959', // White text for better contrast
          fontSize: '1.1rem',
        }}
      >
        Sri Lanka Energies
      </Typography>
    </Box>
  );
}
