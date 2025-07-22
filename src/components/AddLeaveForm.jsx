import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Alert, 
  Paper 
} from '@mui/material';
import '../scss/leave.scss';

const AddLeave = () => {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: '',
    start_date: null,
    end_date: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/leaves/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data.employees);
      } catch (err) {
        setError('Failed to fetch employees: ' + (err.response?.data?.error || err.message));
      }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date, name) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.employee_id || !formData.leave_type || !formData.start_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        employee_id: formData.employee_id,
        leave_type: formData.leave_type,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null,
      };
      const response = await axios.post(`${API_BASE_URL}/leaves`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(response.data.message);
      setFormData({ employee_id: '', leave_type: '', start_date: null, end_date: null });
    } catch (err) {
      setError('Failed to submit leave request: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <Paper className="add-leave-container">
      <Typography variant="h5" className="add-leave-title">
        Add Leave Request
      </Typography>
      {error && (
        <Alert severity="error" className="alert-message">
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" className="alert-message">
          {success}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} className="add-leave-form">
        <FormControl fullWidth className="form-group">
          <InputLabel id="employee-label">Employee</InputLabel>
          <Select
            labelId="employee-label"
            id="employee_id"
            name="employee_id"
            value={formData.employee_id}
            label="Employee"
            onChange={handleChange}
          >
            <MenuItem value="">Select an employee</MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth className="form-group">
          <InputLabel id="leave-type-label">Leave Type</InputLabel>
          <Select
            labelId="leave-type-label"
            id="leave_type"
            name="leave_type"
            value={formData.leave_type}
            label="Leave Type"
            onChange={handleChange}
          >
            <MenuItem value="">Select leave type</MenuItem>
            <MenuItem value="Casual">Casual</MenuItem>
            <MenuItem value="Annual">Annual</MenuItem>
            <MenuItem value="Medical">Medical</MenuItem>
          </Select>
        </FormControl>
        <div className="form-group date-picker-container">
          <label htmlFor="start_date" className="form-label">Start Date</label>
          <DatePicker
            selected={formData.start_date}
            onChange={(date) => handleDateChange(date, 'start_date')}
            dateFormat="yyyy-MM-dd"
            className="form-input"
            placeholderText="Select start date"
            minDate={new Date()}
          />
        </div>
        <div className="form-group date-picker-container">
          <label htmlFor="end_date" className="form-label">End Date (Optional)</label>
          <DatePicker
            selected={formData.end_date}
            onChange={(date) => handleDateChange(date, 'end_date')}
            dateFormat="yyyy-MM-dd"
            className="form-input"
            placeholderText="Select end date"
            minDate={formData.start_date || new Date()}
            isClearable
          />
        </div>
        <Button
          type="submit"
          variant="contained"
          className="submit-button"
        >
          Submit Leave Request
        </Button>
      </Box>
    </Paper>
  );
};

export default AddLeave;