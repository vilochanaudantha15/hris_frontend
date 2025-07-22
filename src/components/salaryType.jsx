import React from 'react';
import { 
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  CssBaseline
} from '@mui/material';
import { Link } from 'react-router-dom'; // Import Link
import '../scss/salaryType.scss';

const salaryTypes = [
  {
    title: 'Non-Executive Roster Labourer',
    description: 'Shift-based workers with rotating schedules',
    className: 'roster',
    icon: '🛠️',
    path: '/roster-labourer'
  },
  {
    title: 'Non-Executive Day Labourer',
    description: 'Daily wage workers with flexible hours',
    className: 'day',
    icon: '👷',
    path: '/day-labourer'
  },
  {
    title: 'Executive',
    description: 'Senior management and leadership roles',
    className: 'executive',
    icon: '👔',
    path: '/executive'
  },
];

const SalaryType = () => {
  return (
    <>
      <CssBaseline />
      <div className="salary-root">
        <Container maxWidth="xl">
          <div className="salary-header">
            <Typography variant="h3" component="h1">
              Salary Types
            </Typography>
            <Typography variant="subtitle1">
              Explore different employment classifications and their compensation ranges
            </Typography>
          </div>

          <Grid container spacing={4}>
            {salaryTypes.map((type) => (
              <Grid item key={type.title} xs={12} sm={6} md={4} className="grid-margin">
                <Link to={type.path} className="tile-link">
                  <Card className={`salary-card ${type.className}`}>
                    <CardContent className="salary-card-content">
                      <Typography variant="h2" className="salary-icon">
                        {type.icon}
                      </Typography>
                      <Typography gutterBottom variant="h5" component="h2">
                        {type.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {type.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>
    </>
  );
};

export default SalaryType;
