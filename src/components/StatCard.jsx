import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip as ChartTooltip,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, ChartTooltip);

const CardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '12px',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundColor: ({ trend }) => 
      trend === 'up' 
        ? theme.palette.success.main 
        : trend === 'down' 
        ? theme.palette.error.main 
        : theme.palette.text.secondary,
  }
}));

const TrendValue = styled(Typography)(({ theme, trend }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '12px',
  backgroundColor:
    trend === 'up'
      ? 'rgba(46, 125, 50, 0.1)'
      : trend === 'down'
      ? 'rgba(211, 47, 47, 0.1)'
      : 'rgba(117, 117, 117, 0.1)',
  color:
    trend === 'up'
      ? theme.palette.success.main
      : trend === 'down'
      ? theme.palette.error.main
      : theme.palette.text.secondary,
  fontWeight: 600,
}));

function StatCard({ title, value, interval, trend, data }) {
  const [showChart, setShowChart] = React.useState(false);

  const handleCardClick = () => {
    setShowChart((prev) => !prev);
  };

  const renderTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon fontSize="small" />;
      case 'down':
        return <TrendingDownIcon fontSize="small" />;
      default:
        return <TrendingFlatIcon fontSize="small" />;
    }
  };

  const calculateTrendPercentage = () => {
    if (data && data.length >= 2) {
      const start = data[0];
      const end = data[data.length - 1];
      const percentage = ((end - start) / start * 100).toFixed(1);
      return percentage > 0 ? `+${percentage}%` : `${percentage}%`;
    }
    return '0%';
  };

  const chartData = {
    labels: Array.from({ length: data.length }, (_, i) => i + 1),
    datasets: [
      {
        label: title,
        data: data,
        borderColor: trend === 'up' ? '#2e7d32' : trend === 'down' ? '#d32f2f' : '#757575',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 100);
          gradient.addColorStop(0, trend === 'up' ? 'rgba(46, 125, 50, 0.3)' : trend === 'down' ? 'rgba(211, 47, 47, 0.3)' : 'rgba(117, 117, 117, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <Tooltip
      title={`Trend: ${calculateTrendPercentage()} over ${interval}`}
      arrow
    >
      <CardContainer onClick={handleCardClick} trend={trend}>
        <Box>
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            gutterBottom
            sx={{ fontWeight: 500, fontSize: '0.875rem' }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h4" 
            component="div"
            sx={{ 
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(90deg, #333, #666)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {value}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {interval}
          </Typography>
          <TrendValue variant="body2" trend={trend}>
            {renderTrendIcon()}
            <span style={{ marginLeft: '4px' }}>{calculateTrendPercentage()}</span>
          </TrendValue>
        </Box>

        <Box sx={{ mt: 2, height: '80px' }}>
          <Line data={chartData} options={chartOptions} />
        </Box>
      </CardContainer>
    </Tooltip>
  );
}

export default StatCard;