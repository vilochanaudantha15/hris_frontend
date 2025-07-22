import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
  Alert,
  AlertTitle,
  Paper,
  Fade,
  Slide,
  Grow,
  useTheme,
  alpha,
  Collapse
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';

const AnimatedCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  },
}));

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
  padding: theme.spacing(4),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const LoanUpload = () => {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const theme = useTheme();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setErrors([]);
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage("Please select an Excel file");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/loans/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(data.message);
      setErrors(data.errors || []);
    } catch (err) {
      setMessage("Error uploading file");
      setErrors([err.response?.data?.error || "Server error"]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <Slide direction="up" in={true} mountOnEnter unmountOnExit>
        <Box sx={{ maxWidth: 800, width: '100%' }}>
          <AnimatedCard elevation={6}>
            <CardContent>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 3,
                  color: theme.palette.primary.main,
                  textAlign: 'center',
                  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Loan Details Upload Portal
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Upload your loan details Excel file for processing
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={9}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    fullWidth
                    sx={{
                      py: 2,
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      '&:hover': {
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        backgroundColor: alpha(theme.palette.primary.light, 0.1)
                      }
                    }}
                  >
                    {file ? (
                      <Typography noWrap>{file.name}</Typography>
                    ) : (
                      'Click to select Excel file (.xlsx, .xls)'
                    )}
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                      hidden
                    />
                  </Button>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isLoading || !file}
                    fullWidth
                    size="large"
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                    sx={{ py: 2 }}
                  >
                    {isLoading ? 'Processing...' : 'Upload Now'}
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  onClick={() => setShowInfo(!showInfo)}
                  startIcon={<InfoIcon />}
                  color="info"
                  size="small"
                >
                  {showInfo ? 'Hide Requirements' : 'Show File Requirements'}
                </Button>
              </Box>

              <Collapse in={showInfo}>
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  mt: 2,
                  border: `1px solid ${theme.palette.info.light}`,
                  borderRadius: 2,
                  background: alpha(theme.palette.info.light, 0.05)
                }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    📋 Excel File Requirements
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography paragraph>
                    Your Excel file should contain the following columns:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="employee_no"
                        secondary="Employee number (e.g., EMP123)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="monthly_loan_amount"
                        secondary="Loan amount per month (numeric value)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="loan_month"
                        secondary="Month of loan in YYYY-MM format (e.g., 2025-07)"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Collapse>

              {message && (
                <Fade in={!!message}>
                  <Box sx={{ mt: 3 }}>
                    <Alert 
                      severity={errors.length ? "error" : "success"}
                      sx={{ mb: 2 }}
                      variant="outlined"
                    >
                      <AlertTitle>{errors.length ? 'Upload Error' : 'Upload Successful'}</AlertTitle>
                      {message}
                    </Alert>
                  </Box>
                </Fade>
              )}

              {errors.length > 0 && (
                <Grow in={errors.length > 0}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    mt: 2,
                    border: `1px solid ${theme.palette.error.light}`,
                    borderRadius: 2,
                    background: alpha(theme.palette.error.light, 0.05)
                  }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="error">
                      ⚠️ Errors Detected
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List dense>
                      {errors.map((error, index) => (
                        <ListItem key={index} sx={{ py: 1 }}>
                          <ListItemText 
                            primary={error} 
                            primaryTypographyProps={{ color: 'error' }} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grow>
              )}
            </CardContent>
          </AnimatedCard>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            Supported formats: .xlsx, .xls • Max file size: 10MB
          </Typography>
        </Box>
      </Slide>
    </GradientBackground>
  );
};

export default LoanUpload;