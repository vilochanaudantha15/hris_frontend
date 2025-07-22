import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Button,
  Modal,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const Employment = () => {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const [employee, setEmployee] = useState({});
  const [editEmployee, setEditEmployee] = useState({});
  const [employees, setEmployees] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchEmploymentInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found, please login again");
      }
      const response = await axios.get(`${API_BASE_URL}/employment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployee(response.data.user);
      setEditEmployee(response.data.user);
      setEmployees(response.data.employees);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch employment info");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmploymentInfo();
  }, []);

  const handleOpenModal = () => {
    setOpenModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditEmployee(employee); // Reset to original data on cancel
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (editEmployee.appointed_date && isNaN(Date.parse(editEmployee.appointed_date))) {
      setError("Invalid appointed date format, use yyyy-MM-dd");
      return;
    }
    if (editEmployee.contract_end_date && isNaN(Date.parse(editEmployee.contract_end_date))) {
      setError("Invalid contract end date format, use yyyy-MM-dd");
      return;
    }
    if (!editEmployee.designation) {
      setError("Designation is required");
      return;
    }

    // Prepare payload, excluding contract_type and plant_id/plant_name
    const payload = {
      designation: editEmployee.designation,
      department: editEmployee.department,
      manager: editEmployee.manager || "",
      appointed_date: editEmployee.appointed_date,
      user_type: editEmployee.user_type,
      key_role: editEmployee.key_role,
      grade_name: editEmployee.grade_name,
      company: editEmployee.company,
      branch_name: editEmployee.branch_name,
      manager_location: editEmployee.manager_location,
      contract_end_date: editEmployee.contract_end_date,
      epf_no: editEmployee.epf_no,
      etf_no: editEmployee.etf_no,
      job_description: editEmployee.job_description,
      medical_certificate: editEmployee.medical_certificate,
      shift_basis: editEmployee.shift_basis,
    };

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/employment`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Employment information updated successfully");
      setEmployee({ ...employee, ...payload }); // Update displayed data
      setTimeout(() => {
        setOpenModal(false);
        setSuccess(null);
      }, 1500); // Close modal after success
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update employment info");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1200px", margin: "auto", padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Employment Details
      </Typography>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      {success && (
        <Typography color="success.main" gutterBottom>
          {success}
        </Typography>
      )}
      <div className="employment-info glassmorphic">
        <div className="info-grid">
          <div className="info-item">
            <label>Designation</label>
            <p>{employee.designation || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Department</label>
            <p>{employee.department || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Manager</label>
            <p>{employee.manager || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Appointed Date</label>
            <p>{employee.appointed_date || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Employment Status</label>
            <p className={`status ${employee.contract_type?.toLowerCase()}`}>
              {employee.contract_type || "Not provided"}
            </p>
          </div>
          <div className="info-item">
            <label>User Type</label>
            <p>{employee.user_type || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Plant</label>
            <p>{employee.plant_name || employee.plant_id || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Key Role</label>
            <p>{employee.key_role || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Grade Name</label>
            <p>{employee.grade_name || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Company</label>
            <p>{employee.company || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Branch Name</label>
            <p>{employee.branch_name || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Manager Location</label>
            <p>{employee.manager_location || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Contract End Date</label>
            <p>{employee.contract_end_date || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>EPF Number</label>
            <p>{employee.epf_no || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>ETF Number</label>
            <p>{employee.etf_no || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Job Description</label>
            <p>{employee.job_description || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Medical Certificate</label>
            <p>{employee.medical_certificate ? "Yes" : "No"}</p>
          </div>
          <div className="info-item">
            <label>Shift Basis</label>
            <p>{employee.shift_basis ? "Yes" : "No"}</p>
          </div>
        </div>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            Edit Employment Info
          </Button>
        </Box>
      </div>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "80vh",
            overflowY: "auto",
            p: 4,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Edit Employment Information
          </Typography>
          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success.main" gutterBottom>
              {success}
            </Typography>
          )}
          <div className="employment-info glassmorphic">
            <div className="info-grid">
              <div className="info-item">
                <label>Designation</label>
                <TextField
                  name="designation"
                  value={editEmployee.designation || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, designation: e.target.value })}
                  fullWidth
                  required
                />
              </div>
              <div className="info-item">
                <label>Department</label>
                <TextField
                  name="department"
                  value={editEmployee.department || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Manager</label>
                <TextField
                  select
                  name="manager"
                  value={editEmployee.manager || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, manager: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="">None</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.name}>
                      {emp.name}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <div className="info-item">
                <label>Appointed Date</label>
                <TextField
                  type="date"
                  name="appointed_date"
                  value={editEmployee.appointed_date || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, appointed_date: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div className="info-item">
                <label>Employment Status</label>
                <TextField
                  disabled
                  value={editEmployee.contract_type || "Not provided"}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>User Type</label>
                <TextField
                  select
                  name="user_type"
                  value={editEmployee.user_type || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, user_type: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Engineer">Engineer</MenuItem>
                </TextField>
              </div>
              <div className="info-item">
                <label>Plant</label>
                <TextField
                  disabled
                  value={editEmployee.plant_name || editEmployee.plant_id || "Not provided"}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Key Role</label>
                <TextField
                  name="key_role"
                  value={editEmployee.key_role || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, key_role: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Grade Name</label>
                <TextField
                  name="grade_name"
                  value={editEmployee.grade_name || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, grade_name: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Company</label>
                <TextField
                  name="company"
                  value={editEmployee.company || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, company: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Branch Name</label>
                <TextField
                  name="branch_name"
                  value={editEmployee.branch_name || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, branch_name: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Manager Location</label>
                <TextField
                  name="manager_location"
                  value={editEmployee.manager_location || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, manager_location: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Contract End Date</label>
                <TextField
                  type="date"
                  name="contract_end_date"
                  value={editEmployee.contract_end_date || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, contract_end_date: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div className="info-item">
                <label>EPF Number</label>
                <TextField
                  name="epf_no"
                  value={editEmployee.epf_no || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, epf_no: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>ETF Number</label>
                <TextField
                  name="etf_no"
                  value={editEmployee.etf_no || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, etf_no: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Job Description</label>
                <TextField
                  name="job_description"
                  value={editEmployee.job_description || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, job_description: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                />
              </div>
              <div className="info-item">
                <label>Medical Certificate</label>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="medical_certificate"
                      checked={editEmployee.medical_certificate || false}
                      onChange={(e) => setEditEmployee({ ...editEmployee, medical_certificate: e.target.checked })}
                    />
                  }
                  label="Submitted"
                />
              </div>
              <div className="info-item">
                <label>Shift Basis</label>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="shift_basis"
                      checked={editEmployee.shift_basis || false}
                      onChange={(e) => setEditEmployee({ ...editEmployee, shift_basis: e.target.checked })}
                    />
                  }
                  label="Shift-Based"
                />
              </div>
            </div>
            <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="contained" color="error" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="contained" color="success" onClick={handleSubmit}>
                Save Changes
              </Button>
            </Box>
          </div>
        </Paper>
      </Modal>
    </Box>
  );
};

export default Employment;