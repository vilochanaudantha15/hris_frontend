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
  Refresh as RefreshIcon
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

const NonEfinalAttendance = () => {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const theme = useTheme();
  const [nonExecutives, setNonExecutives] = useState([]);
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

  const fetchNonExecutives = async () => {
    if (!plantId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to view non-executives');
      }
      const response = await axios.get(`${API_BASE_URL}/non-execute-attendance/non-executives`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { plantId },
      });
      const nonExecData = Array.isArray(response.data) ? response.data : [];
      setNonExecutives(nonExecData);
      setAttendanceData(nonExecData.map(nonExec => ({
        employee_id: nonExec.employee_id,
        shift1: '',
        shift2: '',
        shift3: '',
        ot: '',
        dot: '',
        no_pay_days: '',
        leave_days: '',
        salary_month: month,
      })));
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch non-executives';
      setError(errorMessage);
      setNonExecutives([]);
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
      const response = await axios.get(`${API_BASE_URL}/non-execute-attendance/summary`, {
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
      fetchNonExecutives();
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
        record.shift1 === '' ||
        record.shift2 === '' ||
        record.shift3 === '' ||
        record.ot === '' ||
        record.dot === '' ||
        record.no_pay_days === '' ||
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
        shift1: Number(record.shift1) || 0,
        shift2: Number(record.shift2) || 0,
        shift3: Number(record.shift3) || 0,
        ot: Number(record.ot) || 0,
        dot: Number(record.dot) || 0,
        no_pay_days: Number(record.no_pay_days) || 0,
        leave_days: Number(record.leave_days) || 0,
        salary_month: Number(record.salary_month),
      }));
      await axios.post(
        `${API_BASE_URL}/non-execute-attendance/approve`,
        { plantId, year, month, attendanceData: formattedData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Non-executive attendance approved and saved successfully!');
      setOpenDialog(false);
      setAttendanceData(nonExecutives.map(nonExec => ({
        employee_id: nonExec.employee_id,
        shift1: '',
        shift2: '',
        shift3: '',
        ot: '',
        dot: '',
        no_pay_days: '',
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
      fetchNonExecutives();
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
              Non-Executive Final Attendance
            </Typography>
          }
          subheader="Manage and approve attendance records for non-executive staff"
          avatar={<PersonIcon fontSize="large" color="primary" />}
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
                disabled={nonExecutives.length === 0}
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
          ) : nonExecutives.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No non-executives available for the selected plant.
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
                          <TableCell align="center">Shift 1</TableCell>
                          <TableCell align="center">Shift 2</TableCell>
                          <TableCell align="center">Shift 3</TableCell>
                          <TableCell align="center">OT</TableCell>
                          <TableCell align="center">DOT</TableCell>
                          <TableCell align="center">No-Pay Days</TableCell>
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
                            <TableCell align="center">{row.shift1}</TableCell>
                            <TableCell align="center">{row.shift2}</TableCell>
                            <TableCell align="center">{row.shift3}</TableCell>
                            <TableCell align="center">{row.ot}</TableCell>
                            <TableCell align="center">{row.dot}</TableCell>
                            <TableCell align="center">{row.no_pay_days}</TableCell>
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
            Enter Non-Executive Attendance for {moment().month(month - 1).format('MMMM')} {year}
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
                  <TableCell align="center">Shift 1</TableCell>
                  <TableCell align="center">Shift 2</TableCell>
                  <TableCell align="center">Shift 3</TableCell>
                  <TableCell align="center">OT</TableCell>
                  <TableCell align="center">DOT</TableCell>
                  <TableCell align="center">No-Pay Days</TableCell>
                  <TableCell align="center">Leave Days</TableCell>
                  <TableCell align="center">Salary Month</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nonExecutives.map((nonExec, index) => (
                  <TableRow key={nonExec.employee_id}>
                    <TableCell>{nonExec.employee_id}</TableCell>
                    <TableCell>{nonExec.employee_name}</TableCell>
                    <TableCell>{nonExec.plant_name}</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={attendanceData[index]?.shift1 || ''}
                        onChange={(e) => handleInputChange(nonExec.employee_id, 'shift1', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={attendanceData[index]?.shift2 || ''}
                        onChange={(e) => handleInputChange(nonExec.employee_id, 'shift2', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={attendanceData[index]?.shift3 || ''}
                        onChange={(e) => handleInputChange(nonExec.employee_id, 'shift3', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={attendanceData[index]?.ot || ''}
                        onChange={(e) => handleInputChange(nonExec.employee_id, 'ot', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={attendanceData[index]?.dot || ''}
                        onChange={(e) => handleInputChange(nonExec.employee_id, 'dot', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={attendanceData[index]?.no_pay_days || ''}
                        onChange={(e) => handleInputChange(nonExec.employee_id, 'no_pay_days', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={attendanceData[index]?.leave_days || ''}
                        onChange={(e) => handleInputChange(nonExec.employee_id, 'leave_days', e.target.value)}
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
                          onChange={(e) => handleInputChange(nonExec.employee_id, 'salary_month', e.target.value)}
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

export default NonEfinalAttendance;