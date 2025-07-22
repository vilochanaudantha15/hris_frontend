import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

export default function HRISCardAlert() {
  return (
    <Card variant="outlined" sx={{ m: 1.5, flexShrink: 0, borderColor: 'primary.main' }}>
      <CardContent>
        <AutoAwesomeRoundedIcon fontSize="small" color="primary" />
        <Typography gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Employee Profile Update Required
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Please update your HRIS profile by the end of this week to ensure accurate records.
        </Typography>
        <Button variant="contained" size="small" fullWidth color="primary">
          Update Profile Now
        </Button>
      </CardContent>
    </Card>
  );
}