import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Button,
  Box,
  Modal,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  IconButton
} from "@mui/material";
import axios from "axios";
import "../scss/payroll.scss";
import { Visibility, VisibilityOff, Close, CheckCircle, Error } from "@mui/icons-material";

// Sample bank and branch data
const bankData = [
  {
    name: "Bank of Ceylon",
    bankCode: "7010",
    branches: [
      { name: "Akkaraipattu", branchCode: "590" },
      { name: "Akuressa", branchCode: "613" },
      { name: "Aluthgama", branchCode: "680" },
      { name: "Ambalangoda", branchCode: "35" },
      { name: "Anuradhapura", branchCode: "8" },
    ],
  },
  // ... other banks
];

const Payroll = () => {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employee, setEmployee] = useState({ payroll: {} });
  const [editEmployee, setEditEmployee] = useState({ payroll: {} });
  const [showSalary, setShowSalary] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const fetchAllEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please login again");
      
      const response = await axios.get(`${API_BASE_URL}/employ/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let employeesData = [];
      if (Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (Array.isArray(response.data.employees)) {
        employeesData = response.data.employees;
      } else {
        setError("Invalid API response format");
      }
      
      setEmployees(employeesData);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch employees");
      setLoading(false);
    }
  };

  const fetchPayrollInfo = async (employeeId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please login again");
      
      const response = await axios.get(`${API_BASE_URL}/payroll/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setEmployee(response.data.user);
      setEditEmployee(response.data.user);
      setSelectedBank(response.data.user.payroll?.bankName || "");
      setSelectedBranch(response.data.user.payroll?.branch || "");
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch payroll info");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchPayrollInfo(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const handleOpenModal = () => {
    setOpenModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditEmployee(employee);
    setSelectedBank(employee.payroll?.bankName || "");
    setSelectedBranch(employee.payroll?.branch || "");
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "annualSalary", "monthlySalary", "payGrade", "jobLevel",
      "bankName", "accountNumber", "branch", "taxId", "taxFilingStatus",
      "bankCode", "branchCode", "transactionType"
    ];
    
    const missingFields = requiredFields.filter(key => !editEmployee.payroll[key]);
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    if (isNaN(editEmployee.payroll.annualSalary) || isNaN(editEmployee.payroll.monthlySalary)) {
      setError("Annual and monthly salary must be numbers");
      return;
    }

    const validStatuses = ["Single", "Married", "Head of Household"];
    if (!validStatuses.includes(editEmployee.payroll.taxFilingStatus)) {
      setError(`Tax filing status must be one of: ${validStatuses.join(", ")}`);
      return;
    }

    const validTransactionTypes = ["SBA", "SLI"];
    if (!validTransactionTypes.includes(editEmployee.payroll.transactionType)) {
      setError(`Transaction type must be one of: ${validTransactionTypes.join(", ")}`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/payroll/${selectedEmployeeId}`,
        editEmployee.payroll,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("Payroll information updated successfully");
      setEmployee({ ...employee, payroll: editEmployee.payroll });
      
      setTimeout(() => {
        setOpenModal(false);
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update payroll info");
    }
  };

  const selectedBankData = bankData.find(bank => bank.name === selectedBank);
  const branches = selectedBankData ? selectedBankData.branches : [];
  const bankCode = selectedBankData ? selectedBankData.bankCode : "";
  const branchCode = selectedBranch ? branches.find(b => b.name === selectedBranch)?.branchCode || "" : "";

  useEffect(() => {
    if (selectedBank && selectedBranch) {
      setEditEmployee({
        ...editEmployee,
        payroll: {
          ...editEmployee.payroll,
          bankName: selectedBank,
          branch: selectedBranch,
          bankCode,
          branchCode,
        },
      });
    }
  }, [selectedBank, selectedBranch]);

  if (loading && !selectedEmployeeId) {
    return (
      <Box className="loading-container">
        <CircularProgress size={60} className="loading-spinner" />
      </Box>
    );
  }

  return (
    <div className="payroll-container">
      <div className="header">
        <Typography variant="h2" component="h2">
          Payroll & Compensation
        </Typography>
      </div>

      <div className="employee-select">
        <FormControl fullWidth>
          <InputLabel id="employee-select-label">Select Employee</InputLabel>
          <Select
            labelId="employee-select-label"
            value={selectedEmployeeId}
            label="Select Employee"
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            variant="outlined"
            className="custom-select"
          >
            <MenuItem value=""><em>Select an employee</em></MenuItem>
            {Array.isArray(employees) && employees.length > 0 ? (
              employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name || "Unnamed"} ({emp.email || "No email"})
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No employees available</MenuItem>
            )}
          </Select>
        </FormControl>
      </div>

      {error && (
        <div className="error-message">
          <Error fontSize="small" />
          <Typography>{error}</Typography>
        </div>
      )}

      {success && (
        <div className="success-message">
          <CheckCircle fontSize="small" />
          <Typography>{success}</Typography>
        </div>
      )}

      {selectedEmployeeId && (
        <div className="payroll-card">
          {loading ? (
            <Box className="loading-container">
              <CircularProgress size={40} className="loading-spinner" />
            </Box>
          ) : (
            <>
              <div className="info-grid">
                <div className="info-item">
                  <label>Annual Salary</label>
                  <p>
                    {showSalary 
                      ? `$${Number(employee.payroll?.annualSalary || 0).toLocaleString()}` 
                      : "••••••"}
                  </p>
                </div>
                <div className="info-item">
                  <label>Monthly Salary</label>
                  <p>
                    {showSalary 
                      ? `$${Number(employee.payroll?.monthlySalary || 0).toLocaleString()}` 
                      : "••••••"}
                  </p>
                </div>
                <div className="info-item">
                  <label>Pay Grade</label>
                  <p>{employee.payroll?.payGrade || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Job Level</label>
                  <p>{employee.payroll?.jobLevel || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Bank Name</label>
                  <p>{employee.payroll?.bankName || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Bank Code</label>
                  <p>{employee.payroll?.bankCode || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Branch</label>
                  <p>{employee.payroll?.branch || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Branch Code</label>
                  <p>{employee.payroll?.branchCode || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Account Number</label>
                  <p>{employee.payroll?.accountNumber || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Tax ID</label>
                  <p>{employee.payroll?.taxId || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Tax Filing Status</label>
                  <p>{employee.payroll?.taxFilingStatus || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Transaction Type</label>
                  <p>{employee.payroll?.transactionType || "Not provided"}</p>
                </div>
              </div>

              <div className="action-buttons">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowSalary(!showSalary)}
                  startIcon={showSalary ? <VisibilityOff /> : <Visibility />}
                  className="action-button"
                >
                  {showSalary ? "Hide Salary" : "Show Salary"}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleOpenModal}
                  className="action-button"
                >
                  Edit Payroll Info
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflowY: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 3,
            p: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              pb: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h3" component="h3">
              Edit Payroll Information
            </Typography>
            <IconButton onClick={handleCloseModal} color="default">
              <Close />
            </IconButton>
          </Box>

          {error && (
            <Box
              sx={{
                color: 'error.main',
                bgcolor: 'error.light',
                p: 1.5,
                borderRadius: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Error fontSize="small" />
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}

          {success && (
            <Box
              sx={{
                color: 'success.main',
                bgcolor: 'success.light',
                p: 1.5,
                borderRadius: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CheckCircle fontSize="small" />
              <Typography variant="body2">{success}</Typography>
            </Box>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 2,
              mb: 2,
            }}
          >
            <FormControl fullWidth variant="outlined" size="small" required>
              <InputLabel id="annual-salary-label">Annual Salary</InputLabel>
              <TextField
                labelId="annual-salary-label"
                type="number"
                value={editEmployee.payroll?.annualSalary || ""}
                onChange={(e) =>
                  setEditEmployee({
                    ...editEmployee,
                    payroll: { ...editEmployee.payroll, annualSalary: e.target.value || "" },
                  })
                }
                label="Annual Salary"
                variant="outlined"
                size="small"
              />
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small" required>
              <InputLabel id="monthly-salary-label">Monthly Salary</InputLabel>
              <TextField
                labelId="monthly-salary-label"
                type="number"
                value={editEmployee.payroll?.monthlySalary || ""}
                onChange={(e) =>
                  setEditEmployee({
                    ...editEmployee,
                    payroll: { ...editEmployee.payroll, monthlySalary: e.target.value || "" },
                  })
                }
                label="Monthly Salary"
                variant="outlined"
                size="small"
              />
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small" required>
              <InputLabel id="pay-grade-label">Pay Grade</InputLabel>
              <TextField
                labelId="pay-grade-label"
                value={editEmployee.payroll?.payGrade || ""}
                onChange={(e) =>
                  setEditEmployee({
                    ...editEmployee,
                    payroll: { ...editEmployee.payroll, payGrade: e.target.value || "" },
                  })
                }
                label="Pay Grade"
                variant="outlined"
                size="small"
              />
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small" required>
              <InputLabel id="job-level-label">Job Level</InputLabel>
              <TextField
                labelId="job-level-label"
                value={editEmployee.payroll?.jobLevel || ""}
                onChange={(e) =>
                  setEditEmployee({
                    ...editEmployee,
                    payroll: { ...editEmployee.payroll, jobLevel: e.target.value || "" },
                  })
                }
                label="Job Level"
                variant="outlined"
                size="small"
              />
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small" required>
              <InputLabel id="bank-select-label">Bank Name</InputLabel>
              <Select
                labelId="bank-select-label"
                value={selectedBank}
                label="Bank Name"
                onChange={(e) => {
                  setSelectedBank(e.target.value);
                  setSelectedBranch("");
                }}
                variant="outlined"
                size="small"
              >
                <MenuItem value=""><em>Select a bank</em></MenuItem>
                {bankData.map((bank) => (
                  <MenuItem key={bank.bankCode} value={bank.name}>
                    {bank.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small" disabled>
              <InputLabel id="bank-code-label">Bank Code</InputLabel>
              <TextField
                labelId="bank-code-label"
                value={bankCode}
                label="Bank Code"
                variant="outlined"
                size="small"
              />
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small" required>
              <InputLabel id="branch-select-label">Branch</InputLabel>
              <Select
                labelId="branch-select-label"
                value={selectedBranch}
                label="Branch"
                onChange={(e) => setSelectedBranch(e.target.value)}
                variant="outlined"
                size="small"
                disabled={!selectedBank}
              >
                <MenuItem value=""><em>Select a branch</em></MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.branchCode} value={branch.name}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small" disabled>
              <InputLabel id="branch-code-label">Branch Code</InputLabel>
              <TextField
                labelId="branch-code-label"
                value={branchCode}
                label="Branch Code"
                variant="outlined"
                size="small"
              />
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small" required>
              <InputLabel id="account-number-label">Account Number</InputLabel>
              <TextField
                labelId="account-number-label"
                value={editEmployee.payroll?.accountNumber || ""}
                onChange={(e) =>
                  setEditEmployee({
                    ...editEmployee,
                    payroll: { ...editEmployee.payroll, accountNumber: e.target.value || "" },
                  })
                }
                label="Account Number"
                variant="outlined"
                size="small"
              />
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small" required>
              <InputLabel id="tax-id-label">Tax ID</InputLabel>
              <TextField
                labelId="tax-id-label"
                value={editEmployee.payroll?.taxId || ""}
                onChange={(e) =>
                  setEditEmployee({
                    ...editEmployee,
                    payroll: { ...editEmployee.payroll, taxId: e.target.value || "" },
                  })
                }
                label="Tax ID"
                variant="outlined"
                size="small"
              />
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small" required>
              <InputLabel id="tax-status-label">Tax Filing Status</InputLabel>
              <Select
                labelId="tax-status-label"
                value={editEmployee.payroll?.taxFilingStatus || ""}
                label="Tax Filing Status"
                onChange={(e) =>
                  setEditEmployee({
                    ...editEmployee,
                    payroll: { ...editEmployee.payroll, taxFilingStatus: e.target.value || "" },
                  })
                }
                variant="outlined"
                size="small"
              >
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="Head of Household">Head of Household</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small" required>
              <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
              <Select
                labelId="transaction-type-label"
                value={editEmployee.payroll?.transactionType || ""}
                label="Transaction Type"
                onChange={(e) =>
                  setEditEmployee({
                    ...editEmployee,
                    payroll: { ...editEmployee.payroll, transactionType: e.target.value || "" },
                  })
                }
                variant="outlined"
                size="small"
              >
                <MenuItem value="SBA">SBA</MenuItem>
                <MenuItem value="SLI">SLI</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={handleCloseModal}
              startIcon={<Close />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              startIcon={<CheckCircle />}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Payroll;