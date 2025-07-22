import { useState } from 'react';
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
  alpha
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
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

const TelephoneBillUpload = () => {
  // Define API base URL within the component
  const API_BASE_URL = '/api'; // Use relative path for same-domain (e.g., Nginx reverse proxy)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadStatus(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus({ error: 'Please select a file to upload' });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/telephone-bills/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        setUploadStatus({
          message: result.message,
          results: result.results,
          errors: result.errors,
        });
      } else {
        setUploadStatus({ error: result.error || 'Upload failed' });
      }
    } catch (error) {
      setUploadStatus({ error: 'Failed to upload file. Please try again.' });
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
                Telephone Bill Upload Portal
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Upload your telephone bill Excel file for processing
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
                    onClick={handleUpload}
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

              {uploadStatus && (
                <Fade in={uploadStatus !== null}>
                  <Box sx={{ mt: 4 }}>
                    {uploadStatus.message && (
                      <Alert 
                        severity="success" 
                        sx={{ mb: 2 }}
                        variant="outlined"
                      >
                        <AlertTitle>Upload Successful</AlertTitle>
                        {uploadStatus.message}
                      </Alert>
                    )}

                    {uploadStatus.error && (
                      <Alert 
                        severity="error" 
                        sx={{ mb: 2 }}
                        variant="outlined"
                      >
                        <AlertTitle>Upload Error</AlertTitle>
                        {uploadStatus.error}
                      </Alert>
                    )}

                    {uploadStatus.results && uploadStatus.results.length > 0 && (
                      <Grow in={uploadStatus.results && uploadStatus.results.length > 0}>
                        <Paper elevation={0} sx={{ 
                          p: 3, 
                          mb: 3, 
                          border: `1px solid ${theme.palette.success.light}`,
                          borderRadius: 2,
                          background: alpha(theme.palette.success.light, 0.05)
                        }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            📊 Successful Uploads
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <List dense>
                            {uploadStatus.results.map((result, index) => (
                              <ListItem key={index} sx={{ py: 1 }}>
                                <ListItemText
                                  primary={`Employee ${result.employee_no}`}
                                  secondary={`Bill ID: ${result.billId} • Month: ${result.bill_month} • Status: ${result.message}`}
                                  secondaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      </Grow>
                    )}

                    {uploadStatus.errors && uploadStatus.errors.length > 0 && (
                      <Grow in={uploadStatus.errors && uploadStatus.errors.length > 0}>
                        <Paper elevation={0} sx={{ 
                          p: 3, 
                          border: `1px solid ${theme.palette.error.light}`,
                          borderRadius: 2,
                          background: alpha(theme.palette.error.light, 0.05)
                        }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="error">
                            ⚠️ Errors Detected
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <List dense>
                            {uploadStatus.errors.map((error, index) => (
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
                  </Box>
                </Fade>
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

export default TelephoneBillUpload;