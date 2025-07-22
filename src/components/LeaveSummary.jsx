import React from "react";
import PropTypes from "prop-types";
import { TextField, MenuItem, Button, LinearProgress } from "@mui/material";

const LeaveSummary = ({
  employee = {},
  editMode = false,
  setEmployee = () => {},
  leaveHistory = [],
  leaveRequests = [],
  leaveRequest = { type: "", startDate: "", endDate: "", status: "Pending" },
  setLeaveRequests = () => {},
  setRecentActivities = () => {},
  handleLeaveRequestChange = () => {},
  handleLeaveRequestSubmit = () => {},
  handleCancelLeaveRequest = () => {},
}) => {
  return (
    <div className="leaves-info glassmorphic">
      <h2>Leave Summary</h2>

      {/* Leave Balance Section */}
      <div className="leave-balance">
        <h3>Leave Balance</h3>
        <div className="info-grid">
          {["leave_l1", "leave_l2", "leave_clerk"].map((field) => (
            <div className="info-item" key={field}>
              <label>{field.replace("_", " ").toUpperCase()}</label>
              {editMode ? (
                <TextField
                  type="number"
                  name={field}
                  value={employee[field] || ""}
                  onChange={(e) =>
                    setEmployee({ ...employee, [field]: e.target.value })
                  }
                  fullWidth
                />
              ) : (
                <p>{employee[field] || "Not set"}</p>
              )}
            </div>
          ))}

          {["vacation", "sick", "personal"].map((type) => {
            const data = employee.leaveBalance?.[type] || {};
            const percentage =
              data.total && data.total > 0
                ? (data.remaining / data.total) * 100
                : 0;

            return (
              <div className="info-item" key={type}>
                <label>{type.charAt(0).toUpperCase() + type.slice(1)} (Mock)</label>
                <p>
                  Total: {data.total || "N/A"} | Used: {data.used || "N/A"} | Remaining: {data.remaining || "N/A"}
                </p>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  className="leave-progress"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave History Section */}
      <div className="leave-history">
        <h3>Leave History</h3>
        <table className="leave-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveHistory.length === 0 ? (
              <tr>
                <td colSpan="4">No leave history found.</td>
              </tr>
            ) : (
              leaveHistory.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.type}</td>
                  <td>{leave.startDate}</td>
                  <td>{leave.endDate}</td>
                  <td className={`status ${leave.status?.toLowerCase()}`}>
                    {leave.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Leave Request Form */}
      <div className="leave-requests">
        <h3>Leave Requests</h3>
        <div className="leave-request-form">
          <TextField
            select
            label="Leave Type"
            name="type"
            value={leaveRequest.type}
            onChange={handleLeaveRequestChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="Vacation">Vacation</MenuItem>
            <MenuItem value="Sick">Sick</MenuItem>
            <MenuItem value="Personal">Personal</MenuItem>
          </TextField>

          <TextField
            type="date"
            label="Start Date"
            name="startDate"
            value={leaveRequest.startDate}
            onChange={handleLeaveRequestChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            type="date"
            label="End Date"
            name="endDate"
            value={leaveRequest.endDate}
            onChange={handleLeaveRequestChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <Button
            variant="contained"
            color="primary"
            className="submit-leave-btn"
            onClick={handleLeaveRequestSubmit}
          >
            Submit Leave Request
          </Button>
        </div>

        {/* Pending Requests */}
        <h4>Pending Requests</h4>
        <table className="leave-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.length === 0 ? (
              <tr>
                <td colSpan="5">No pending leave requests.</td>
              </tr>
            ) : (
              leaveRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.type}</td>
                  <td>{request.startDate}</td>
                  <td>{request.endDate}</td>
                  <td className={`status ${request.status?.toLowerCase()}`}>
                    {request.status}
                  </td>
                  <td>
                    <button
                      className="cancel-leave-btn"
                      onClick={() => handleCancelLeaveRequest(request.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Optional: Add PropTypes
LeaveSummary.propTypes = {
  employee: PropTypes.object,
  editMode: PropTypes.bool,
  setEmployee: PropTypes.func,
  leaveHistory: PropTypes.array,
  leaveRequests: PropTypes.array,
  leaveRequest: PropTypes.object,
  setLeaveRequests: PropTypes.func,
  setRecentActivities: PropTypes.func,
  handleLeaveRequestChange: PropTypes.func,
  handleLeaveRequestSubmit: PropTypes.func,
  handleCancelLeaveRequest: PropTypes.func,
};

export default LeaveSummary;
