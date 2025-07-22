import React from 'react';
import { 
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  CssBaseline,
  Box
} from '@mui/material';
import { Link } from 'react-router-dom';
import '../scss/salaryType.scss';

const attendanceTypes = [
  {
    title: 'Non-Executive Day Workers',
    description: 'Daily wage workers with flexible hours',
    className: 'day',
    icon: '👷',
    path: '/nonfinalattendance'
  },
  {
    title: 'Executives',
    description: 'Senior management and leadership roles',
    className: 'executive',
    icon: '👔',
    path: '/finalattendance'
  },
];

const AttendanceType = () => {
  return (
    <>
      <CssBaseline />
      <Box 
        className="attendance-root"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          py: 8,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              textAlign: 'center',
              mb: 8,
              px: { xs: 2, sm: 0 }
            }}
          >
            <Typography 
              variant="h2" 
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}
            >
              Attendance Types
            </Typography>
            <Typography 
              variant="subtitle1"
              sx={{
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                fontSize: '1.1rem'
              }}
            >
              Select your employment classification to proceed
            </Typography>
          </Box>

          <Grid 
            container 
            spacing={4} 
            justifyContent="center"
            sx={{
              px: { xs: 2, sm: 4 }
            }}
          >
            {attendanceTypes.map((type) => (
              <Grid 
                item 
                key={type.title} 
                xs={12} 
                sm={6} 
                md={5}
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Link 
                  to={type.path} 
                  style={{ 
                    textDecoration: 'none',
                    width: '100%',
                    maxWidth: 400
                  }}
                >
                  <Card 
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(31, 38, 135, 0.2)'
                      },
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <CardContent 
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <Typography 
                        variant="h2" 
                        sx={{
                          fontSize: '3.5rem',
                          mb: 3,
                          lineHeight: 1
                        }}
                      >
                        {type.icon}
                      </Typography>
                      <Typography 
                        variant="h5" 
                        component="h2"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: 'text.primary'
                        }}
                      >
                        {type.title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{
                          color: 'text.secondary',
                          mb: 2
                        }}
                      >
                        {type.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default AttendanceType;