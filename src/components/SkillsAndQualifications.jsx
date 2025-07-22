import React, { useState, useEffect } from "react";
import {
  TextField,
  Box,
  Button,
  Modal,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

const SkillsAndQualifications = () => {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const [employee, setEmployee] = useState({ education: "", skills: [] });
  const [editEmployee, setEditEmployee] = useState({ education: "", skills: [] });
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch skills and qualifications data
  const fetchSkillsInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found, please login again");
      }
      const response = await axios.get(`${API_BASE_URL}/skills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.user || { education: "", skills: [] }; // Fallback to empty object
      setEmployee(data);
      setEditEmployee(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch skills info");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsInfo();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);
    setEditEmployee((prev) => ({ ...prev, skills }));
  };

  const handleSubmit = async () => {
    // Enhanced validation
    if (!editEmployee.education.trim()) {
      setError("Education is required");
      return;
    }
    if (!Array.isArray(editEmployee.skills) || editEmployee.skills.length === 0) {
      setError("At least one skill is required");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/skills`,
        { education: editEmployee.education, skills: editEmployee.skills },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Skills information updated successfully");
      setEmployee(response.data.user || editEmployee); // Update with API response
      setTimeout(() => {
        setOpenModal(false);
        setSuccess(null);
      }, 1500); // Close modal after success
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update skills info");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(5px)" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1200px", margin: "auto", padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Skills & Qualifications
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <div className="skills-info glassmorphic">
        <div className="info-grid">
          <div className="info-item">
            <label>Education</label>
            <p>{employee.education || "Not provided"}</p>
          </div>
          <div className="info-item">
            <label>Skills</label>
            <div className="skills-container">
              {employee.skills && employee.skills.length > 0 ? (
                employee.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))
              ) : (
                <p>Not provided</p>
              )}
            </div>
          </div>
        </div>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            Edit Skills & Qualifications
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
            Edit Skills & Qualifications
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          <div className="skills-info glassmorphic">
            <div className="info-grid">
              <div className="info-item">
                <label>Education</label>
                <TextField
                  name="education"
                  value={editEmployee.education || ""}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                  required
                  disabled={loading}
                />
              </div>
              <div className="info-item">
                <label>Skills</label>
                <TextField
                  value={editEmployee.skills ? editEmployee.skills.join(", ") : ""}
                  onChange={handleSkillsChange}
                  placeholder="Enter skills separated by commas"
                  fullWidth
                  disabled={loading}
                />
              </div>
            </div>
            <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          </div>
        </Paper>
      </Modal>
    </Box>
  );
};

export default SkillsAndQualifications;