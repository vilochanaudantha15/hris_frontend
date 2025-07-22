import * as React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const StyledCalendarDay = styled(Box)(({ theme, isSelected, hasEvent }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  borderRadius: '50%',
  cursor: 'pointer',
  fontSize: '0.75rem',
  backgroundColor: isSelected ? theme.palette.primary.main : 'transparent',
  color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  border: hasEvent ? `1px solid ${theme.palette.primary.light}` : 'none',
  minWidth: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  '&:hover': {
    backgroundColor: isSelected ? theme.palette.primary.dark : theme.palette.action.hover,
  },
}));

const CompactCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sample events data
  const events = [
    { date: '2025-07-04', title: 'Independence Day', description: 'Company event at 6 PM' },
    { date: '2025-07-10', title: 'Team Meeting', description: 'Quarterly review' },
    { date: '2025-07-15', title: 'Product Launch', description: 'New feature release' },
  ];

  // Generate calendar days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add padding for first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Check if date has events
  const hasEvent = (date) => {
    if (!date) return false;
    return events.some(event => event.date === date.toISOString().split('T')[0]);
  };

  // Get events for selected date
  const getEventsForDate = (date) => {
    return events.filter(event => event.date === date.toISOString().split('T')[0]);
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Calendar Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1 
      }}>
        <IconButton size="small" onClick={goToPreviousMonth}>
          <ChevronLeft fontSize="small" />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
        </Typography>
        <IconButton size="small" onClick={goToNextMonth}>
          <ChevronRight fontSize="small" />
        </IconButton>
      </Box>

      {/* Weekday Headers */}
      <Grid container spacing={0.5} sx={{ mb: 1 }}>
        {weekdays.map((day, index) => (
          <Grid xs key={index}>
            <Typography variant="caption" sx={{ 
              display: 'block', 
              textAlign: 'center',
              fontSize: '0.65rem',
              color: 'text.secondary'
            }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Days */}
      <Grid container spacing={0.5}>
        {days.map((day, index) => (
          <Grid xs key={index}>
            <StyledCalendarDay
              isSelected={day ? day.toDateString() === selectedDate.toDateString() : undefined}
              hasEvent={day ? hasEvent(day) : undefined}
              onClick={() => day && setSelectedDate(day)}
            >
              {day ? day.getDate() : ''}
            </StyledCalendarDay>
          </Grid>
        ))}
      </Grid>

      {/* Events List */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ 
          fontWeight: 'bold',
          fontSize: '0.75rem',
          mb: 1
        }}>
          Events
        </Typography>
        <List dense sx={{ py: 0 }}>
          {getEventsForDate(selectedDate).length > 0 ? (
            getEventsForDate(selectedDate).map((event) => (
              <ListItem key={event.title} sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={event.title}
                  secondary={event.description}
                  primaryTypographyProps={{ 
                    variant: 'caption',
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                  }}
                  secondaryTypographyProps={{ 
                    variant: 'caption',
                    fontSize: '0.65rem'
                  }}
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="caption" sx={{ 
              fontSize: '0.65rem',
              color: 'text.secondary',
              fontStyle: 'italic'
            }}>
              No events
            </Typography>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default CompactCalendar;