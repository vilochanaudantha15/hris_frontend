import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideMenu from "./SideMenu";
import PersonalInfo from "../components/PersonalInfo";
import EmploymentDetails from "../components/Employment";
import SkillsQualifications from "../components/SkillsAndQualifications";
import Documents from "../components/Documents";
import LeaveSummary from "../components/LeaveSummary";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../scss/userprofile.scss";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProfilePage = () => {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [leaveRequest, setLeaveRequest] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [employee, setEmployee] = useState(null);

  // Mock attendance data for visualization
  const mockAttendanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Attendance Days",
        data: [20, 22, 22, 18, 19, 20],
        backgroundColor: "#3498db",
      },
    ],
  };

  // Mock leave history, requests, notifications, and activities
  const [leaveHistory, setLeaveHistory] = useState([
    {
      id: 1,
      type: "Vacation",
      startDate: "2025-06-01",
      endDate: "2025-06-05",
      status: "Approved",
    },
    {
      id: 2,
      type: "Sick",
      startDate: "2025-05-10",
      endDate: "2025-05-11",
      status: "Approved",
    },
    {
      id: 3,
      type: "Personal",
      startDate: "2025-04-15",
      endDate: "2025-04-15",
      status: "Rejected",
    },
  ]);

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      type: "Vacation",
      startDate: "2025-07-01",
      endDate: "2025-07-03",
      status: "Pending",
    },
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "HR",
      message: "Annual performance review scheduled for July 10",
      timestamp: "2025-06-24 09:00",
      priority: "high",
    },
    {
      id: 2,
      type: "System",
      message: "Payroll processed for June 2025",
      timestamp: "2025-06-23 15:30",
      priority: "medium",
    },
    {
      id: 3,
      type: "Notice",
      message: "Company holiday on July 4",
      timestamp: "2025-06-20 12:00",
      priority: "low",
    },
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: "Uploaded Employment Contract", date: "2025-06-20" },
    { id: 2, action: "Requested Vacation Leave", date: "2025-06-18" },
    { id: 3, action: "Updated Skills", date: "2025-06-15" },
  ]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found");
        navigate("/", { replace: true });
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/userprofile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        setEmployee({
          name: data.user.name || "Unknown User",
          designation: data.user.designation || "Not specified",
          department: data.user.department || "Not specified",
          email: data.user.email || "Not provided",
          phone: data.user.phone || "Not provided",
          location: data.user.location || "Not specified",
          appointedDate: data.user.appointedDate || "Not provided",
          employeeId: data.user.employeeId || "Not provided",
          manager: data.user.manager || "Not specified",
          status: data.user.status || "Active",
          skills: data.user.skills || [],
          education: data.user.education || "Not provided",
          emergencyContact: data.user.emergencyContact || "Not provided",
          leaveBalance: data.user.leaveBalance || {
            vacation: { total: 20, used: 5, remaining: 15 },
            sick: { total: 10, used: 3, remaining: 7 },
            personal: { total: 5, used: 2, remaining: 3 },
          },
        });
        setProfilePicPreview(data.user.avatar || null);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
      }
    };

    fetchUser();
  }, [navigate]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    } else {
      alert("Please upload a valid image file");
    }
  };

  const handleSkillChange = (e) => {
    const skills = e.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);
    setEmployee((prev) => ({ ...prev, skills }));
  };

  const handleLeaveRequestChange = (e) => {
    const { name, value } = e.target;
    setLeaveRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeaveRequestSubmit = async () => {
    if (leaveRequest.type && leaveRequest.startDate && leaveRequest.endDate) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/employ/leave`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(leaveRequest),
        });

        if (!res.ok) {
          throw new Error("Failed to submit leave request");
        }

        const newRequest = {
          id: leaveRequests.length + 1,
          ...leaveRequest,
          status: "Pending",
        };
        setLeaveRequests([...leaveRequests, newRequest]);
        setRecentActivities((prev) => [
          {
            id: prev.length + 1,
            action: `Requested ${leaveRequest.type} Leave`,
            date: new Date().toISOString().split("T")[0],
          },
          ...prev,
        ]);
        setLeaveRequest({ type: "", startDate: "", endDate: "" });
        alert("Leave request submitted");
      } catch (err) {
        setError("Failed to submit leave request");
      }
    } else {
      alert("Please fill all leave request fields");
    }
  };

  const handleCancelLeaveRequest = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/employ/leave/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to cancel leave request");
      }

      setLeaveRequests(leaveRequests.filter((req) => req.id !== id));
      setRecentActivities((prev) => [
        {
          id: prev.length + 1,
          action: "Cancelled Leave Request",
          date: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
      alert("Leave request cancelled");
    } catch (err) {
      setError("Failed to cancel leave request");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", employee.name);
      formData.append("designation", employee.designation);
      formData.append("department", employee.department);
      formData.append("email", employee.email);
      formData.append("phone", employee.phone);
      formData.append("location", employee.location);
      formData.append("appointedDate", employee.appointedDate);
      formData.append("employeeId", employee.employeeId);
      formData.append("manager", employee.manager);
      formData.append("status", employee.status);
      formData.append("skills", JSON.stringify(employee.skills));
      formData.append("education", employee.education);
      formData.append("emergencyContact", employee.emergencyContact);
      if (profilePic) {
        formData.append("profile_pic", profilePic);
      }

      const res = await fetch(`${API_BASE_URL}/userprofile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      setEmployee(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setProfilePic(null);
      setProfilePicPreview(data.user.avatar || null);
      setEditMode(false);
      alert("Profile updated successfully");
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  if (!employee) {
    return (
      <Box>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: "calc(var(--template-frame-height, 0px + 4px))",
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <div className="profile-container">
          <div className="real-time-clock">Current Time: {currentTime}</div>

          <div className="profile-header">
            <div className="avatar-container">
              <div className="avatar">
                {profilePicPreview ? (
                  <img src={profilePicturePreview} alt="Profile" />
                ) : (
                  <span>{employee.name.split(" ").map((n) => n[0]).join("")}</span>
                )}
              </div>
              <div className="status-indicator"></div>
              {editMode && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="profile-pic-upload"
                />
              )}
            </div>
            <div className="header-info">
              <h1>{employee.name}</h1>
              <p className="position">{employee.designation}</p>
              <p className="department">{employee.department} Department</p>
              <div className="employee-id">
                Employee ID: {employee.employeeId}
              </div>
            </div>
            <div className="header-actions">
              <button
                className={`edit-btn ${editMode ? "cancel" : ""}`}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </button>
              {editMode && (
                <button className="save-btn" onClick={handleSave}>
                  Save Changes
                </button>
              )}
              <button
                className="settings-btn"
                onClick={() => setSettingsOpen(true)}
              >
                Settings
              </button>
            </div>
          </div>

          <div className="profile-nav">
            <button
              className={activeTab === "personal" ? "active" : ""}
              onClick={() => setActiveTab("personal")}
            >
              Personal Info
            </button>
            <button
              className={activeTab === "employment" ? "active" : ""}
              onClick={() => setActiveTab("employment")}
            >
              Employment
            </button>
            <button
              className={activeTab === "skills" ? "active" : ""}
              onClick={() => setActiveTab("skills")}
            >
              Skills & Qualifications
            </button>
            <button
              className={activeTab === "documents" ? "active" : ""}
              onClick={() => setActiveTab("documents")}
            >
              Documents
            </button>
            <button
              className={activeTab === "activities" ? "active" : ""}
              onClick={() => setActiveTab("activities")}
            >
              Recent Activities
            </button>
            <button
              className={activeTab === "leaves" ? "active" : ""}
              onClick={() => setActiveTab("leaves")}
            >
              Leave Summary
            </button>
            <button
              className={activeTab === "notifications" ? "active" : ""}
              onClick={() => setActiveTab("notifications")}
            >
              Notifications
            </button>
          </div>

          <div className="profile-content">
            {activeTab === "personal" && (
              <PersonalInfo
                employee={employee}
                editMode={editMode}
                handleInputChange={handleInputChange}
              />
            )}
            {activeTab === "employment" && (
              <EmploymentDetails
                employee={employee}
                editMode={editMode}
                handleInputChange={handleInputChange}
              />
            )}
            {activeTab === "skills" && (
              <SkillsQualifications
                employee={employee}
                editMode={editMode}
                handleSkillChange={handleSkillChange}
                handleInputChange={handleInputChange}
              />
            )}
            {activeTab === "documents" && <Documents />}
            {activeTab === "activities" && (
              <div className="activities-info glassmorphic">
                <h2>Recent Activities</h2>
                <div className="timeline">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="timeline-item">
                      <div className="timeline-icon">
                        <i className="fas fa-circle"></i>
                      </div>
                      <div className="timeline-content">
                        <p>{activity.action}</p>
                        <span>{activity.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "leaves" && (
              <LeaveSummary
                employee={employee}
                leaveHistory={leaveHistory}
                leaveRequests={leaveRequests}
                leaveRequest={leaveRequest}
                handleLeaveRequestChange={handleLeaveRequestChange}
                handleLeaveRequestSubmit={handleLeaveRequestSubmit}
                handleCancelLeaveRequest={handleCancelLeaveRequest}
              />
            )}
            {activeTab === "notifications" && (
              <div className="notifications-info glassmorphic">
                <h2>Notifications & Announcements</h2>
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${notification.priority}`}
                    >
                      <div className="notification-icon">
                        <i
                          className={`fas fa-${
                            notification.type === "HR"
                              ? "users"
                              : notification.type === "System"
                              ? "cog"
                              : "bell"
                          }`}
                        ></i>
                      </div>
                      <div className="notification-content">
                        <p>{notification.message}</p>
                        <span>{notification.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogContent>
              <div className="settings-option">
                <label>
                  <input type="checkbox" defaultChecked /> Receive email notifications
                </label>
              </div>
              <div className="settings-option">
                <label>
                  <input type="checkbox" /> Receive SMS notifications
                </label>
              </div>
              <div className="settings-option">
                <button className="change-password-btn">Change Password</button>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
              <Button
                onClick={() => setSettingsOpen(false)}
                color="primary"
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </Box>
    </Box>
  );
};

export default ProfilePage;