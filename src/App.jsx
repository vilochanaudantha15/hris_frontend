import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import AttendanceType from './components/AttendanceType';
import EPlantSelection from './components/EPlantSelection';
import NonExePlantSelection from './components/NonExePlantSelection';
import Calendar from './components/Calendar';
import Roster from './components/Roster';
import SignIn from './Pages/Login';
import SignUp from './Pages/SignUp';
import Employee from './components/Employee';
import EmployeeForm from './components/EmployeeForm';
import AttendanceSystem from './components/Attendance';
import ProfilePage from './components/UserProfile';
import SalaryManagement from './components/salary';
import SalaryType from './components/salaryType';
import RosterLabourerSalary from './components/rosterLabourerSalary';
import ExecutiveAttendance from './components/ExecutiveAttandance';
import AddLeaveForm from './components/AddLeaveForm';
import ExecutiveSummary from './components/ExecutiveSummary';
import NonExecutiveDayWorkers from './components/NonExecutiveDayWorkers';
import LoanUpload from './components/LoanUpload';
import TelephoneBillUpload from './components/TelephoneBillUpload';
import LaborerAttendance from './components/LaborerAttendance';
import FinalAttendance from './components/FinalAttendance';
import NonEfinalAttendance from './components/NonEfinalAttendance';
import Payroll from './components/Payroll';

// Define API base URL
const API_BASE_URL = '/api';

// ProtectedRoute component to restrict access to authenticated users with valid token
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch(${API_BASE_URL}/user, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: Bearer ${token},
          },
        });

        if (!res.ok) {
          throw new Error('Token verification failed');
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error('Token verification error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);

  // While verifying, show a loading state to prevent flashing content
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans">
        <div className="container mx-auto p-6">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AttendanceSystem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/execetiveattendance"
              element={
                <ProtectedRoute>
                  <ExecutiveAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendanceType"
              element={
                <ProtectedRoute>
                  <AttendanceType />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eplantselection"
              element={
                <ProtectedRoute>
                  <EPlantSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nonplantselection"
              element={
                <ProtectedRoute>
                  <NonExePlantSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roster"
              element={
                <ProtectedRoute>
                  <Roster />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <Employee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employeeform"
              element={
                <ProtectedRoute>
                  <EmployeeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userprofile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary"
              element={
                <ProtectedRoute>
                  <SalaryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salarytype"
              element={
                <ProtectedRoute>
                  <SalaryType />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rosterlabourersalary"
              element={
                <ProtectedRoute>
                  <RosterLabourerSalary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/labourerattendance"
              element={
                <ProtectedRoute>
                  <LaborerAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addleave"
              element={
                <ProtectedRoute>
                  <AddLeaveForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/executivesummary"
              element={
                <ProtectedRoute>
                  <ExecutiveSummary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nonexecutivesummary"
              element={
                <ProtectedRoute>
                  <NonExecutiveDayWorkers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finalattendance"
              element={
                <ProtectedRoute>
                  <FinalAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nonfinalattendance"
              element={
                <ProtectedRoute>
                  <NonEfinalAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute>
                  <Payroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loan"
              element={
                <ProtectedRoute>
                  <LoanUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/telephoneBill"
              element={
                <ProtectedRoute>
                  <TelephoneBillUpload />
                </ProtectedRoute>
              }
            />
            {/* Redirect unknown routes to signin */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
