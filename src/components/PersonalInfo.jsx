import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Box,
  Button,
  Modal,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const PersonalInfo = () => {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const [employee, setEmployee] = useState({});
  const [editEmployee, setEditEmployee] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchPersonalInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found, please login again");
      }
      const response = await axios.get(`${API_BASE_URL}/personalinfo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployee(response.data.user);
      setEditEmployee(response.data.user);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch personal info");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalInfo();
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
    if (editEmployee.email_address && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmployee.email_address)) {
      setError("Invalid email address format");
      return;
    }
    if (editEmployee.date_of_birth && isNaN(Date.parse(editEmployee.date_of_birth))) {
      setError("Invalid date of birth format");
      return;
    }
    if (editEmployee.nic_issue_date && isNaN(Date.parse(editEmployee.nic_issue_date))) {
      setError("Invalid NIC issue date format");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/personalinfo`, editEmployee, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Personal information updated successfully");
      setEmployee(editEmployee); // Update displayed data
      setTimeout(() => {
        setOpenModal(false);
        setSuccess(null);
      }, 1500); // Close modal after success
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update personal info");
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
        Personal Information
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
      <div className="personal-info glassmorphic">
        <div className="info-grid">
          <div className="info-item">
            <label>Title</label>
            <p>{employee.title || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Initials</label>
            <p>{employee.initials || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Last Name</label>
            <p>{employee.last_name || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Other Names</label>
            <p>{employee.other_names || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Gender</label>
            <p>{employee.gender || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Marital Status</label>
            <p>{employee.marital_status || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Date of Birth</label>
            <p>{employee.date_of_birth || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>NIC Number</label>
            <p>{employee.nic_no || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>NIC Issue Date</label>
            <p>{employee.nic_issue_date || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Address Number</label>
            <p>{employee.address_no || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Street</label>
            <p>{employee.street || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>City</label>
            <p>{employee.city || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>District</label>
            <p>{employee.district || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Telephone Number</label>
            <p>{employee.tel_no || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Mobile Number</label>
            <p>{employee.mobile_no || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Email Address</label>
            <p>{employee.email_address || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Police Station</label>
            <p>{employee.police_station || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Grama Niladhari Division</label>
            <p>{employee.gr_division || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Nationality</label>
            <p>{employee.nationality || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Religion</label>
            <p>{employee.religion || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Emergency Contact Name</label>
            <p>{employee.emergency_contact_name || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Emergency Contact Relationship</label>
            <p>{employee.emergency_contact_relationship || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Emergency Contact Number</label>
            <p>{employee.emergency_contact_no || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Emergency Contact Mobile</label>
            <p>{employee.emergency_contact_mobile || "Not provided"}</p>
          </div>
        </div>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            Edit Personal Info
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
            Edit Personal Information
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
          <div className="personal-info glassmorphic">
            <div className="info-grid">
              <div className="info-item">
                <label>Title</label>
                <TextField
                  name="title"
                  value={editEmployee.title || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, title: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Initials</label>
                <TextField
                  name="initials"
                  value={editEmployee.initials || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, initials: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Last Name</label>
                <TextField
                  name="last_name"
                  value={editEmployee.last_name || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, last_name: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Other Names</label>
                <TextField
                  name="other_names"
                  value={editEmployee.other_names || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, other_names: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Gender</label>
                <TextField
                  select
                  name="gender"
                  value={editEmployee.gender || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, gender: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </div>
              <div className="info-item">
                <label>Marital Status</label>
                <TextField
                  select
                  name="marital_status"
                  value={editEmployee.marital_status || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, marital_status: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                </TextField>
              </div>
              <div className="info-item">
                <label>Date of Birth</label>
                <TextField
                  type="date"
                  name="date_of_birth"
                  value={editEmployee.date_of_birth || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, date_of_birth: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div className="info-item">
                <label>NIC Number</label>
                <TextField
                  name="nic_no"
                  value={editEmployee.nic_no || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, nic_no: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>NIC Issue Date</label>
                <TextField
                  type="date"
                  name="nic_issue_date"
                  value={editEmployee.nic_issue_date || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, nic_issue_date: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div className="info-item">
                <label>Address Number</label>
                <TextField
                  name="address_no"
                  value={editEmployee.address_no || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, address_no: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Street</label>
                <TextField
                  name="street"
                  value={editEmployee.street || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, street: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>City</label>
                <TextField
                  name="city"
                  value={editEmployee.city || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, city: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>District</label>
                <TextField
                  name="district"
                  value={editEmployee.district || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, district: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Telephone Number</label>
                <TextField
                  name="tel_no"
                  value={editEmployee.tel_no || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, tel_no: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Mobile Number</label>
                <TextField
                  name="mobile_no"
                  value={editEmployee.mobile_no || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, mobile_no: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Email Address</label>
                <TextField
                  type="email"
                  name="email_address"
                  value={editEmployee.email_address || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, email_address: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Police Station</label>
                <TextField
                  name="police_station"
                  value={editEmployee.police_station || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, police_station: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Grama Niladhari Division</label>
                <TextField
                  name="gr_division"
                  value={editEmployee.gr_division || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, gr_division: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Nationality</label>
                <TextField
                  name="nationality"
                  value={editEmployee.nationality || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, nationality: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Religion</label>
                <TextField
                  name="religion"
                  value={editEmployee.religion || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, religion: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Emergency Contact Name</label>
                <TextField
                  name="emergency_contact_name"
                  value={editEmployee.emergency_contact_name || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, emergency_contact_name: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Emergency Contact Relationship</label>
                <TextField
                  name="emergency_contact_relationship"
                  value={editEmployee.emergency_contact_relationship || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, emergency_contact_relationship: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Emergency Contact Number</label>
                <TextField
                  name="emergency_contact_no"
                  value={editEmployee.emergency_contact_no || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, emergency_contact_no: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="info-item">
                <label>Emergency Contact Mobile</label>
                <TextField
                  name="emergency_contact_mobile"
                  value={editEmployee.emergency_contact_mobile || ""}
                  onChange={(e) => setEditEmployee({ ...editEmployee, emergency_contact_mobile: e.target.value })}
                  fullWidth
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

export default PersonalInfo;