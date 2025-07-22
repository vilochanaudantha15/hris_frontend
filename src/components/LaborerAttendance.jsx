import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import AppTheme from '../shared-theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import ColorModeSelect from '../shared-theme/ColorModeSelect';

const LaborerAttendance = () => {
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [plants, setPlants] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch plants and initialize
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const plantsRes = await fetch('http://localhost:4000/employ/power-plants');
        if (!plantsRes.ok) throw new Error('Failed to fetch plants');
        const plantsData = await plantsRes.json();
        setPlants(plantsData);
        if (plantsData.length > 0) setSelectedPlant(plantsData[0].id.toString());
      } catch (error) {
        setError(error.message);
        showSnackbar(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch summary data when plant, year, or month changes
  useEffect(() => {
    if (selectedPlant && selectedYear && selectedMonth) {
      fetchSummaryData();
    }
  }, [selectedPlant, selectedYear, selectedMonth]);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
      const endDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${new Date(selectedYear, selectedMonth, 0).getDate()}`;
      const res = await fetch(
        `http://localhost:4000/labourer-attendance/roster?plantId=${selectedPlant}&startDate=${startDate}&endDate=${endDate}&shift=all`
      );
      if (!res.ok) throw new Error('Failed to fetch attendance summary');
      const data = await res.json();
      setSummaryData(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message);
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Laborer Attendance Summary
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Plant</InputLabel>
            <Select
              value={selectedPlant}
              label="Plant"
              onChange={(e) => setSelectedPlant(e.target.value)}
              disabled={loading || plants.length === 0}
            >
              {plants.map((plant) => (
                <MenuItem key={plant.id} value={plant.id}>
                  {plant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <MenuItem key={month} value={month}>
                  {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <AttendanceSummaryTable data={summaryData} />
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppTheme>
  );
};

// Attendance Summary Table Component
const AttendanceSummaryTable = ({ data }) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="attendance summary table">
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Plant</TableCell>
              <TableCell align="right">Shifts</TableCell>
              <TableCell align="right">OT Hours</TableCell>
              <TableCell align="right">DOT Days</TableCell>
              <TableCell align="right">Morning</TableCell>
              <TableCell align="right">Day</TableCell>
              <TableCell align="right">Night</TableCell>
              <TableCell align="right">Payable Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No attendance records found for the selected period
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.employee_id} hover>
                  <TableCell>{row.employee_id}</TableCell>
                  <TableCell>{row.employee_name}</TableCell>
                  <TableCell>{row.plant_name}</TableCell>
                  <TableCell align="right">{row.total_shifts}</TableCell>
                  <TableCell align="right">{row.total_ot_hours.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.total_dot}</TableCell>
                  <TableCell align="right">{row.morning_shifts}</TableCell>
                  <TableCell align="right">{row.day_shifts}</TableCell>
                  <TableCell align="right">{row.night_shifts}</TableCell>
                  <TableCell align="right">{row.total_payable_hours.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default LaborerAttendance;