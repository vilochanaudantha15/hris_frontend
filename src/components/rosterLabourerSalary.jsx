import React, { useState, useEffect } from 'react';
import AppTheme from '../shared-theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import '../scss/roster.scss'; // Reuse existing styles for consistency

const RosterLabourerSalary = (props) => {
  const [powerPlants, setPowerPlants] = useState([]);
  const [laborerHours, setLaborerHours] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchPowerPlants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:4000/roster/power-plants');
        if (!response.ok) throw new Error(`Failed to fetch power plants: ${await response.text()}`);
        const plants = await response.json();
        setPowerPlants(plants);
        if (plants.length > 0) setSelectedPlant(plants[0]);
      } catch (err) {
        setError(err.message);
        console.error('Power plants fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPowerPlants();
  }, []);

  useEffect(() => {
    if (selectedPlant) {
      fetchLaborerHours(selectedPlant, selectedYear, month);
    }
  }, [selectedPlant, selectedYear, month]);

  const fetchLaborerHours = async (plant, year, month) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4000/rosters/laborer-hours?plant=${plant}&year=${year}&month=${month}`);
      if (!response.ok) throw new Error(`Failed to fetch laborer hours: ${await response.text()}`);
      const data = await response.json();
      setLaborerHours(data);
    } catch (err) {
      setError(err.message);
      console.error('Laborer hours fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLaborerHoursTable = () => {
    if (isLoading) return <Typography className="loading" color="text.primary">Loading...</Typography>;
    if (error) return <Typography className="error" color="error.main">Error: {error}</Typography>;
    if (!laborerHours.length) {
      return <Typography color="text.primary">No laborers found for the selected period.</Typography>;
    }

    return (
      <Box className="roster-table-wrapper">
        <table className="roster-table">
          <thead>
            <tr>
              <th>Employee Number</th>
              <th>Name</th>
              <th>Total Hours Worked</th>
            </tr>
          </thead>
          <tbody>
            {laborerHours.map((laborer) => (
              <tr key={laborer.id}>
                <td>{laborer.emp_no}</td>
                <td>{laborer.name}</td>
                <td>{laborer.totalHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          p: { xs: 2, sm: 4 },
        }}
      >
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Box className="roster-container">
          <Box className="roster-header">
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              Laborer Hours - {months[month]} {selectedYear}
            </Typography>
            <Box className="roster-controls">
              <select
                value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
                disabled={isLoading}
                style={{ backgroundColor: 'background.paper', color: 'text.primary' }}
              >
                {powerPlants.map(plant => (
                  <option key={plant} value={plant}>{plant}</option>
                ))}
              </select>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                disabled={isLoading}
                style={{ backgroundColor: 'background.paper', color: 'text.primary' }}
              >
                {months.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                disabled={isLoading}
                style={{ backgroundColor: 'background.paper', color: 'text.primary' }}
              />
            </Box>
          </Box>
          {renderLaborerHoursTable()}
        </Box>
      </Box>
    </AppTheme>
  );
};

export default RosterLabourerSalary;