import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import '../scss/executiveSummary.scss';

const ExecutiveSummary = () => {
  const [summary, setSummary] = useState([]);
  const [plants, setPlants] = useState([]);
  const [plantId, setPlantId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPowerPlants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4000/api/executive-summary/power-plants');
      const plantData = Array.isArray(response.data) ? response.data : [];
      setPlants(plantData);
      if (plantData.length > 0) {
        setPlantId(plantData[0].id);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch power plants';
      setError(errorMessage);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (!plantId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to view the summary');
      }
      const response = await axios.get('http://localhost:4000/api/executive-summary/summary', {
        headers: { Authorization: `Bearer ${token}` },
        params: { plantId, year, month },
      });
      setSummary(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch summary';
      setError(errorMessage);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!plantId) {
      setError('Please select a power plant to approve the summary');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to approve the summary');
      }
      await axios.post(
        'http://localhost:4000/api/executive-summary/approve',
        { plantId, year, month, summaryData: summary },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Summary approved and saved successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to approve summary';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPowerPlants();
  }, []);

  useEffect(() => {
    if (plantId) {
      fetchSummary();
    }
  }, [plantId, year, month]);

  const yearsConfig = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 5 + i);
  const monthsConfig = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Container className="executive-summary">
      <Typography variant="h4" component="h1" className="title">
        Executive Summary
      </Typography>
      <Box className="filters">
        <FormControl variant="outlined" className="filter-select">
          <InputLabel>Power Plant</InputLabel>
          <Select
            value={plantId}
            onChange={(e) => setPlantId(Number(e.target.value))}
            label="Power Plant"
            disabled={loading || plants.length === 0}
          >
            {plants.length === 0 ? (
              <MenuItem value="">No plants available</MenuItem>
            ) : (
              plants.map((plant) => (
                <MenuItem key={plant.id} value={plant.id}>
                  {plant.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <FormControl variant="outlined" className="filter-select">
          <InputLabel>Year</InputLabel>
          <Select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            label="Year"
          >
            {yearsConfig.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" className="filter-select">
          <InputLabel>Month</InputLabel>
          <Select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            label="Month"
          >
            {monthsConfig.map((m) => (
              <MenuItem key={m} value={m}>
                {moment().month(m - 1).format('MMMM')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {error && (
        <Alert severity="error" className="alert">
          {error}
        </Alert>
      )}
      {loading ? (
        <Box className="loading">
          <CircularProgress />
        </Box>
      ) : summary.length === 0 ? (
        <Typography className="no-data">
          No data available for the selected plant and period.
        </Typography>
      ) : (
        <Box>
          <TableContainer component={Paper} className="table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Plant</TableCell>
                  <TableCell>Total Days Worked</TableCell>
                  <TableCell>No-Pay Days</TableCell>
                  <TableCell>Holiday Claims</TableCell>
                  <TableCell>Leave Days</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.map((row) => (
                  <TableRow key={row.employee_id}>
                    <TableCell>{row.employee_id}</TableCell>
                    <TableCell>{row.employee_name}</TableCell>
                    <TableCell>{row.plant_name}</TableCell>
                    <TableCell>{row.total_days_worked}</TableCell>
                    <TableCell>{row.no_pay_days}</TableCell>
                    <TableCell>{row.holiday_claims}</TableCell>
                    <TableCell>{row.leave_days}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApprove}
            disabled={loading || summary.length === 0 || !plantId}
            className="approve-button"
          >
            Approve
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ExecutiveSummary;
