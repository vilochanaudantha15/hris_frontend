import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

function renderStatus(status) {
  const colors = {
    Active: 'success',
    Inactive: 'default',
  };

  return <Chip label={status} color={colors[status]} size="small" />;
}

export function renderAvatar(params) {
  if (params.value == null) {
    return '';
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: '24px',
        height: '24px',
        fontSize: '0.85rem',
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

export const columns = [
  {
    field: 'avatar',
    headerName: '',
    width: 40,
    renderCell: renderAvatar,
  },
  {
    field: 'employeeName',
    headerName: 'Employee Name',
    flex: 1.5,
    minWidth: 150,
  },
  {
    field: 'department',
    headerName: 'Department',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.5,
    minWidth: 80,
    renderCell: (params) => renderStatus(params.value),
  },
  {
    field: 'attendance',
    headerName: 'Attendance (%)',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'leaveBalance',
    headerName: 'Leave Balance (Days)',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 120,
  },
];

export const rows = [
  {
    id: 1,
    avatar: { name: 'Suneth', color: '#3f51b5' },
    employeeName: 'Suneth',
    department: 'Engineering',
    status: 'Active',
    attendance: 95,
    leaveBalance: 12,
  },
  {
    id: 2,
    avatar: { name: 'Ajith', color: '#f50057' },
    employeeName: 'Ajith',
    department: 'Marketing',
    status: 'Active',
    attendance: 88,
    leaveBalance: 8,
  },
  {
    id: 3,
    avatar: { name: 'Janaka', color: '#4caf50' },
    employeeName: 'Janaka',
    department: 'Human Resources',
    status: 'Inactive',
    attendance: 75,
    leaveBalance: 15,
  },
  {
    id: 4,
    avatar: { name: 'Kamal', color: '#ff9800' },
    employeeName: 'Kamal',
    department: 'Sales',
    status: 'Active',
    attendance: 92,
    leaveBalance: 10,
  },
  {
    id: 5,
    avatar: { name: 'Bimal', color: '#9c27b0' },
    employeeName: 'Kamal',
    department: 'Finance',
    status: 'Inactive',
    attendance: 80,
    leaveBalance: 9,
  },
];
