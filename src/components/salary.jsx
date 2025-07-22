import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../scss/salary.scss';

const SalaryTable = () => {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const navigate = useNavigate();

  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      options.push({ value: monthStr, label: monthName });
    }
    return options;
  };

  const monthOptions = getMonthOptions();

  useEffect(() => {
    const fetchSalaries = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found, please log in');
        }
        const response = await axios.get(`${API_BASE_URL}/salaries/salaries?month=${selectedMonth}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Received salaries for ${selectedMonth}:`, JSON.stringify(response.data, null, 2));
        response.data.forEach(salary => {
          console.log(`Employee ${salary.employee_id} (${salary.emp_no}): ` +
                      `loan_deduction=${salary.loan_deduction}, ` +
                      `telephone_bill_deduction=${salary.telephone_bill_deduction}, ` +
                      `total_deductions=${salary.total_deductions}`);
        });
        setSalaries(response.data);
        setError(null);
      } catch (err) {
        console.error('Fetch salaries error:', err);
        if (err.message === 'No token found, please log in' || err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired or unauthorized. Please log in.');
          navigate('/login');
        } else {
          setError(err.response?.data?.error || err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSalaries();
  }, [selectedMonth, navigate]);

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found, please log in');
      }
      const payload = salaries.map(salary => {
        const sanitized = {
          employee_id: salary.employee_id,
          emp_no: salary.emp_no,
          employee_name: salary.employee_name,
          basic_salary: salary.basic_salary,
          epf_deduction: salary.epf_deduction,
          employer_epf: salary.employer_epf,
          etf: salary.etf,
          tax_deduction: salary.tax_deduction,
          loan_deduction: salary.loan_deduction,
          telephone_bill_deduction: salary.telephone_bill_deduction,
          stamp_deduction: salary.stamp_deduction,
          welfare_deduction: salary.welfare_deduction,
          insurance_deduction: salary.insurance_deduction,
          no_pay_days: salary.no_pay_days,
          no_pay_deduction: salary.no_pay_deduction,
          leave_days: salary.leave_days,
          holiday_claims: salary.holiday_claims !== undefined ? salary.holiday_claims : null,
          holiday_claim_amount: salary.holiday_claim_amount !== undefined ? salary.holiday_claim_amount : null,
          ot_hours: salary.ot_hours !== undefined ? salary.ot_hours : null,
          ot_amount: salary.ot_amount !== undefined ? salary.ot_amount : null,
          dot_hours: salary.dot_hours !== undefined ? salary.dot_hours : null,
          dot_amount: salary.dot_amount !== undefined ? salary.dot_amount : null,
          salary_arrears: salary.salary_arrears,
          gross_salary: salary.gross_salary,
          total_deductions: salary.total_deductions,
          net_pay: salary.net_pay,
          salary_month: salary.salary_month
        };
        // Log any undefined fields
        Object.entries(sanitized).forEach(([key, value]) => {
          if (value === undefined) {
            console.warn(`Undefined value detected for ${key} in salary for employee ${sanitized.employee_id}`);
          }
        });
        return sanitized;
      });

      console.log('Sending approve salaries payload:', JSON.stringify(payload, null, 2));

      await axios.post(`${API_BASE_URL}/salaries/salaries/approve`, { salaries: payload }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Salaries approved successfully!');
    } catch (err) {
      console.error('Approve salaries error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or unauthorized. Please log in.');
        navigate('/login');
      } else {
        alert('Failed to approve salaries: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const generateTextFile = () => {
    if (salaries.length === 0) {
      alert('No data to export');
      return;
    }

    const monthYear = selectedMonth.split('-');
    const year = monthYear[0];
    const monthNum = parseInt(monthYear[1], 10);
    const monthAbbr = new Date(year, monthNum - 1).toLocaleString('default', { month: 'short' });
    const formattedDate = `${monthAbbr}_${year}`;

    let textContent = '';
    salaries.forEach(salary => {
      const empNo = (salary.emp_no || '0').padStart(5, '0'); // 16-20
      const employeeName = (salary.employee_name || '').padEnd(24, ' '); // 22-45
      const accountNumber = (salary.account_number || '').padStart(12, '0'); // 47-58
      const bankCode = (salary.bank_code || '0000').padStart(4, '0'); // 60-63
      const branchCode = (salary.branch_code || '000').padStart(3, '0'); // 65-67
      const netPay = parseFloat(salary.net_pay || 0).toFixed(2).padStart(10, '0'); // 69-78
      const bankIdentifier = ['SBA', 'SLI'].includes(salary.bank_code) ? salary.bank_code : 'SLI'; // 89-91
      const nicNo = (salary.nic_no || '').padStart(12, '0'); // 93-104
      const mobileNo = (salary.mobile_no || '').padStart(10, '0'); // 106-115

      const line = ' '.repeat(15) +
                  empNo +
                  ' '.repeat(1) +
                  employeeName +
                  ' '.repeat(1) +
                  accountNumber +
                  ' '.repeat(1) +
                  bankCode +
                  ' '.repeat(1) +
                  branchCode +
                  ' '.repeat(1) +
                  netPay +
                  ' '.repeat(1) +
                  'Employee' +
                  ' '.repeat(4) +
                  bankIdentifier +
                  ' '.repeat(1) +
                  nicNo +
                  mobileNo +
                  '\n';

      textContent += line;
    });

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Salary_Transfer_File_SLE_HQ_MEMP_${monthAbbr}_${year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="salary-dashboard">
      <h1 className="salary-dashboard__title">
        Employee Salary Details for {monthOptions.find(opt => opt.value === selectedMonth)?.label}
      </h1>
      <div className="salary-dashboard__controls">
        <label htmlFor="monthSelect" className="salary-dashboard__label">Select Month:</label>
        <select
          id="monthSelect"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="salary-dashboard__select"
        >
          {monthOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      {error ? (
        <div className="salary-dashboard__error">Error: {error}</div>
      ) : loading ? (
        <div className="salary-dashboard__loading">
          <div className="salary-dashboard__spinner"></div>
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <div className="salary-dashboard__table-wrapper">
            <table className="salary-table">
              <thead>
                <tr className="salary-table__header">
                  <th className="salary-table__cell">Employee ID</th>
                  <th className="salary-table__cell">Employee No</th>
                  <th className="salary-table__cell">Employee Name</th>
                  <th className="salary-table__cell">Basic Salary</th>
                  <th className="salary-table__cell">OT Hours</th>
                  <th className="salary-table__cell">OT Amount</th>
                  <th className="salary-table__cell">DOT Hours</th>
                  <th className="salary-table__cell">DOT Amount</th>
                  <th className="salary-table__cell">Holiday Claims</th>
                  <th className="salary-table__cell">Salary Arrears</th>
                  <th className="salary-table__cell">Gross Salary</th>
                  <th className="salary-table__cell">EPF (10%)</th>
                  <th className="salary-table__cell">Monthly Loan Amount</th>
                  <th className="salary-table__cell">Loan Deduction</th>
                  <th className="salary-table__cell">Telephone Bill Amount</th>
                  <th className="salary-table__cell">Welfare</th>
                  <th className="salary-table__cell">Insurance</th>
                  <th className="salary-table__cell">No Pay Days</th>
                  <th className="salary-table__cell">No Pay Deduction</th>
                  <th className="salary-table__cell">Total Deductions</th>
                  <th className="salary-table__cell">Net Pay</th>
                  <th className="salary-table__cell">Employer EPF (15%)</th>
                  <th className="salary-table__cell">ETF (3%)</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map(salary => (
                  <tr key={`${salary.employee_id}-${salary.salary_month}`} className="salary-table__row">
                    <td className="salary-table__cell">{salary.employee_id}</td>
                    <td className="salary-table__cell">{salary.emp_no}</td>
                    <td className="salary-table__cell">{salary.employee_name}</td>
                    <td className="salary-table__cell">{salary.basic_salary}</td>
                    <td className={`salary-table__cell ${salary.user_type !== 'NonExecutive' ? 'salary-table__cell--inactive' : ''}`}>
                      {salary.ot_hours || '-'}
                    </td>
                    <td className={`salary-table__cell ${salary.user_type !== 'NonExecutive' ? 'salary-table__cell--inactive' : ''}`}>
                      {salary.ot_amount}
                    </td>
                    <td className={`salary-table__cell ${salary.user_type !== 'NonExecutive' ? 'salary-table__cell--inactive' : ''}`}>
                      {salary.dot_hours || '-'}
                    </td>
                    <td className={`salary-table__cell ${salary.user_type !== 'NonExecutive' ? 'salary-table__cell--inactive' : ''}`}>
                      {salary.dot_amount}
                    </td>
                    <td className={`salary-table__cell ${salary.user_type !== 'Executive' ? 'salary-table__cell--inactive' : ''}`}>
                      {salary.holiday_claims || '-'}
                    </td>
                    <td className="salary-table__cell">{salary.salary_arrears}</td>
                    <td className="salary-table__cell">{salary.gross_salary}</td>
                    <td className="salary-table__cell">{salary.epf_deduction}</td>
                    <td className="salary-table__cell">{parseFloat(salary.loan_amount) > 0 ? salary.loan_amount : '-'}</td>
                    <td className="salary-table__cell">{parseFloat(salary.loan_deduction) > 0 ? salary.loan_deduction : '-'}</td>
                    <td className="salary-table__cell">{parseFloat(salary.telephone_bill_deduction) > 0 ? salary.telephone_bill_deduction : '-'}</td>
                    <td className="salary-table__cell">{salary.welfare_deduction}</td>
                    <td className="salary-table__cell">{salary.insurance_deduction}</td>
                    <td className="salary-table__cell">{salary.no_pay_days}</td>
                    <td className="salary-table__cell">{salary.no_pay_deduction}</td>
                    <td className="salary-table__cell">{salary.total_deductions}</td>
                    <td className="salary-table__cell">{salary.net_pay}</td>
                    <td className="salary-table__cell">{salary.employer_epf}</td>
                    <td className="salary-table__cell">{salary.etf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="salary-dashboard__actions">
            <button
              onClick={handleApprove}
              className="salary-dashboard__button salary-dashboard__button--primary"
              disabled={salaries.length === 0}
            >
              Approve Salaries for {monthOptions.find(opt => opt.value === selectedMonth)?.label}
            </button>
            <button
              onClick={generateTextFile}
              className="salary-dashboard__button salary-dashboard__button--secondary"
              disabled={salaries.length === 0}
            >
              Download Salary Transfer File
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SalaryTable;