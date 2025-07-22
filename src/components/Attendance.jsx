import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add, Upload, Close } from '@mui/icons-material';
import AppTheme from '../shared-theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import ColorModeSelect from '../shared-theme/ColorModeSelect';

const Attendance = () => {
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [employees, setEmployees] = useState([]);
  const [plants, setPlants] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch data effects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plantsRes, employeesRes] = await Promise.all([
          fetch('http://localhost:4000/employ/power-plants'),
          fetch('http://localhost:4000/employ/employees/non-executives')
        ]);

        if (!plantsRes.ok || !employeesRes.ok) throw new Error('Failed to fetch data');

        const plantsData = await plantsRes.json();
        const employeesData = await employeesRes.json();

        setPlants(plantsData);
        setEmployees(employeesData);
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

  useEffect(() => {
    if (selectedPlant && selectedYear && selectedMonth) {
      fetchAttendanceSummary();
    }
  }, [selectedPlant, selectedYear, selectedMonth]);

  const fetchAttendanceSummary = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/attendance/summary?plantId=${selectedPlant}&year=${selectedYear}&month=${selectedMonth}`
      );
      if (!res.ok) throw new Error('Failed to fetch attendance summary');
      const data = await res.json();
      setAttendanceSummary(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message);
      showSnackbar(error.message, 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredEmployees = employees.filter(emp => emp.plant_id === parseInt(selectedPlant));

  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Non-Executive Day Workers Attendance Management
          </Typography>
          <Box>
            <Tooltip title="Add Attendance">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenAddDialog(true)}
                sx={{ mr: 2 }}
              >
                Add
              </Button>
            </Tooltip>
            <Tooltip title="Upload Excel">
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setOpenUploadDialog(true)}
              >
                Upload
              </Button>
            </Tooltip>
          </Box>
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
          <AttendanceSummaryTable data={attendanceSummary} />
        )}

        {/* Add Attendance Dialog */}
        <AddAttendanceDialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          employees={filteredEmployees}
          onSuccess={() => {
            fetchAttendanceSummary();
            showSnackbar('Attendance recorded successfully');
          }}
        />

        {/* Upload Excel Dialog */}
        <UploadExcelDialog
          open={openUploadDialog}
          onClose={() => setOpenUploadDialog(false)}
          onSuccess={() => {
            fetchAttendanceSummary();
            showSnackbar('Attendance data uploaded successfully');
          }}
        />

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

// Add Attendance Dialog Component
const AddAttendanceDialog = ({ open, onClose, employees, onSuccess }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    inTime: '',
    outTime: '',
    shift: '',
    status: 'Pending'
  });

  const shifts = ['Morning', 'Day', 'Night'];
  const statuses = ['Pending', 'Approved', 'Rejected'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to submit attendance');
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Add Attendance Record
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Employee</InputLabel>
            <Select
              name="employeeId"
              value={formData.employeeId}
              label="Employee"
              onChange={handleChange}
              required
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name} ({emp.emp_no})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            fullWidth
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Shift</InputLabel>
            <Select
              name="shift"
              value={formData.shift}
              label="Shift"
              onChange={handleChange}
              required
            >
              {shifts.map((shift) => (
                <MenuItem key={shift} value={shift}>
                  {shift}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="In Time"
              type="time"
              name="inTime"
              value={formData.inTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Out Time"
              type="time"
              name="outTime"
              value={formData.outTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleChange}
              required
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save Attendance
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Upload Excel Dialog Component
const UploadExcelDialog = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('http://localhost:4000/attendance/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Failed to upload file');
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Upload Attendance Excel
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please select an Excel file with attendance records. Ensure the file follows the required format.
          </Typography>
          
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Select File
            <input
              type="file"
              hidden
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
          </Button>
          
          {file && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Selected: {file.name}
              </Typography>
              <IconButton size="small" onClick={() => setFile(null)}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!file || isUploading}
          startIcon={isUploading ? <CircularProgress size={20} /> : null}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
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
              <TableCell align="right">Holiday Hours</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
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
                  <TableCell align="right">{row.holiday_hours.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor:
                          row.status === 'Approved'
                            ? 'success.light'
                            : row.status === 'Rejected'
                            ? 'error.light'
                            : 'warning.light',
                        color:
                          row.status === 'Approved'
                            ? 'success.contrastText'
                            : row.status === 'Rejected'
                            ? 'error.contrastText'
                            : 'warning.contrastText'
                      }}
                    >
                      {row.status}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Attendance;