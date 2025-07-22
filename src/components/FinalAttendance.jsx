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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  styled
} from '@mui/material';
import {
  CheckCircleOutline as ApproveIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarIcon,
  Factory as PlantIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.primary.light,
    '& .MuiTableCell-root': {
      color: theme.palette.primary.contrastText,
      fontWeight: 'bold'
    }
  },
  '& .MuiTableRow-root:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8]
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 'bold',
  borderRadius: '8px',
  padding: '8px 16px',
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

const FinalAttendance = () => {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const theme = useTheme();
  const [executives, setExecutives] = useState([]);
  const [summary, setSummary] = useState([]);
  const [plants, setPlants] = useState([]);
  const [plantId, setPlantId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [attendanceData, setAttendanceData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchPowerPlants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/executive-summary/power-plants`);
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

  const fetchExecutives = async () => {
    if (!plantId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to view executives');
      }
      const response = await axios.get(`${API_BASE_URL}/final-attendance/executives`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { plantId },
      });
      const execData = Array.isArray(response.data) ? response.data : [];
      setExecutives(execData);
      setAttendanceData(execData.map(exec => ({
        employee_id: exec.employee_id,
        total_days_worked: '',
        no_pay_days: '',
        holiday_claims: '',
        leave_days: '',
        salary_month: month,
      })));
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch executives';
      setError(errorMessage);
      setExecutives([]);
      setAttendanceData([]);
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
        throw new Error('Please log in to view summary');
      }
      const response = await axios.get(`${API_BASE_URL}/final-attendance/summary`, {
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

  const handleRefresh = () => {
    fetchPowerPlants();
    if (plantId) {
      fetchExecutives();
      fetchSummary();
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (employeeId, field, value) => {
    setAttendanceData(prev =>
      prev.map(record =>
        record.employee_id === employeeId
          ? { ...record, [field]: value }
          : record
      )
    );
  };

  const handleApprove = async () => {
    if (!plantId) {
      setError('Please select a power plant to approve attendance');
      return;
    }
    const invalidRecords = attendanceData.filter(
      record =>
        record.total_days_worked === '' ||
        record.no_pay_days === '' ||
        record.holiday_claims === '' ||
        record.leave_days === '' ||
        !record.salary_month ||
        isNaN(record.salary_month) ||
        record.salary_month < 1 ||
        record.salary_month > 12
    );
    if (invalidRecords.length > 0) {
      setError('Please fill in all fields, including a valid salary month (1-12), for all employees');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to approve attendance');
      }
      const formattedData = attendanceData.map(record => ({
        employee_id: record.employee_id,
        total_days_worked: Number(record.total_days_worked) || 0,
        no_pay_days: Number(record.no_pay_days) || 0,
        holiday_claims: Number(record.holiday_claims) || 0,
        leave_days: Number(record.leave_days) || 0,
        salary_month: Number(record.salary_month),
      }));
      await axios.post(
        `${API_BASE_URL}/final-attendance/approve`,
        { plantId, year, month, attendanceData: formattedData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Final attendance approved and saved successfully!');
      setOpenDialog(false);
      setAttendanceData(executives.map(exec => ({
        employee_id: exec.employee_id,
        total_days_worked: '',
        no_pay_days: '',
        holiday_claims: '',
        leave_days: '',
        salary_month: month,
      })));
      fetchSummary();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to approve attendance';
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
      fetchExecutives();
      fetchSummary();
    }
  }, [plantId, year, month]);

  const yearsConfig = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 5 + i);
  const monthsConfig = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <StyledCard sx={{ mb: 4 }}>
        <CardHeader
          title={
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>
              Executive Final Attendance
            </Typography>
          }
          subheader="Manage and approve attendance records for executive staff"
          avatar={<BusinessIcon fontSize="large" color="primary" />}
          action={
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} color="primary" disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Power Plant</InputLabel>
                <Select
                  value={plantId}
                  onChange={(e) => setPlantId(Number(e.target.value))}
                  label="Power Plant"
                  disabled={loading || plants.length === 0}
                  startAdornment={<PlantIcon color="action" sx={{ mr: 1 }} />}
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
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Year</InputLabel>
                <Select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  label="Year"
                  startAdornment={<CalendarIcon color="action" sx={{ mr: 1 }} />}
                >
                  {yearsConfig.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth variant="outlined">
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
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
              <StyledButton
                variant="contained"
                color="primary"
                onClick={handleOpenDialog}
                startIcon={<EditIcon />}
                fullWidth
                disabled={executives.length === 0}
              >
                Enter Attendance
              </StyledButton>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={60} />
            </Box>
          ) : executives.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No executives available for the selected plant.
              </Typography>
            </Box>
          ) : (
            <Box>
              {summary.length > 0 && (
                <>
                  <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.secondary.dark }}>
                    Approved Attendance Summary
                  </Typography>
                  <StyledTableContainer sx={{ mb: 4 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Plant</TableCell>
                          <TableCell align="center">Days Worked</TableCell>
                          <TableCell align="center">No-Pay Days</TableCell>
                          <TableCell align="center">Holiday Claims</TableCell>
                          <TableCell align="center">Leave Days</TableCell>
                          <TableCell align="center">Salary Month</TableCell>
                          <TableCell align="center">Approved At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.map((row) => (
                          <TableRow key={row.employee_id}>
                            <TableCell>{row.employee_id}</TableCell>
                            <TableCell>{row.employee_name}</TableCell>
                            <TableCell>{row.plant_name}</TableCell>
                            <TableCell align="center">{row.total_days_worked}</TableCell>
                            <TableCell align="center">{row.no_pay_days}</TableCell>
                            <TableCell align="center">{row.holiday_claims}</TableCell>
                            <TableCell align="center">{row.leave_days}</TableCell>
                            <TableCell align="center">{moment().month(row.salary_month - 1).format('MMMM')}</TableCell>
                            <TableCell align="center">{moment(row.approved_at).format('YYYY-MM-DD HH:mm')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
                </>
              )}
            </Box>
          )}
        </CardContent>
      </StyledCard>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
          <Box display="flex" alignItems="center">
            <ApproveIcon sx={{ mr: 1 }} />
            Enter Executive Attendance for {moment().month(month - 1).format('MMMM')} {year}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <StyledTableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Plant</TableCell>
                  <TableCell align="center">Days Worked</TableCell>
                  <TableCell align="center">No-Pay Days</TableCell>
                  <TableCell align="center">Holiday Claims</TableCell>
                  <TableCell align="center">Leave Days</TableCell>
                  <TableCell align="center">Salary Month</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {executives.map((exec, index) => (
                  <TableRow key={exec.employee_id}>
                    <TableCell>{exec.employee_id}</TableCell>
                    <TableCell>{exec.employee_name}</TableCell>
                    <TableCell>{exec.plant_name}</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={attendanceData[index]?.total_days_worked || ''}
                        onChange={(e) => handleInputChange(exec.employee_id, 'total_days_worked', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={attendanceData[index]?.no_pay_days || ''}
                        onChange={(e) => handleInputChange(exec.employee_id, 'no_pay_days', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={attendanceData[index]?.holiday_claims || ''}
                        onChange={(e) => handleInputChange(exec.employee_id, 'holiday_claims', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={attendanceData[index]?.leave_days || ''}
                        onChange={(e) => handleInputChange(exec.employee_id, 'leave_days', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <FormControl variant="outlined" size="small" sx={{ minWidth: '120px' }}>
                        <InputLabel>Month</InputLabel>
                        <Select
                          value={attendanceData[index]?.salary_month || ''}
                          onChange={(e) => handleInputChange(exec.employee_id, 'salary_month', e.target.value)}
                          label="Month"
                        >
                          {monthsConfig.map((m) => (
                            <MenuItem key={m} value={m}>
                              {moment().month(m - 1).format('MMMM')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <StyledButton onClick={handleCloseDialog} color="secondary" variant="outlined">
            Cancel
          </StyledButton>
          <StyledButton 
            onClick={handleApprove} 
            color="primary" 
            variant="contained"
            startIcon={<ApproveIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Approve All'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FinalAttendance;