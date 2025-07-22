import * as React from 'react';
import { Link } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

// Icons
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FolderSharedRoundedIcon from '@mui/icons-material/FolderSharedRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';

const mainListItems = [
  { text: 'Personal Information', icon: <HomeRoundedIcon />, path: '/personal-info', color: '#003087' }, // Dark Navy Blue
  { text: 'Personal File', icon: <FolderSharedRoundedIcon />, path: '/personal-file', color: '#154734' }, // Dark Forest Green
  { text: 'Attendance Request', icon: <EventAvailableRoundedIcon />, path: '/attendance-request', color: '#8b0000' }, // Dark Red
  { text: 'Attendance', icon: <GroupRoundedIcon />, path: '/attendanceType', color: '#3c006c' }, // Dark Purple
  { text: 'Shift Details', icon: <ScheduleRoundedIcon />, path: '/shift-details', color: '#8f3a00' }, // Dark Burnt Orange
  { text: 'Employees', icon: <GroupRoundedIcon />, path: '/employees', color: '#3c006c' }, // Dark Purple
];

const secondaryListItems = [
  { text: 'Salary', icon: <PaidRoundedIcon />, path: '/salary', color: '#004c8c' }, // Dark Cyan
  { text: 'Payroll', icon: <BeachAccessRoundedIcon />, path: '/payroll', color: '#6b003f' }, // Dark Magenta
  { text: 'Loan', icon: <AssignmentTurnedInRoundedIcon />, path: '/loan', color: '#003d33' }, // Dark Teal
  { text: 'Telephone Bill', icon: <CardGiftcardRoundedIcon />, path: '/telephoneBill', color: '#8c6b00' }, // Dark Gold
  { text: 'Medical Claim Request', icon: <LocalHospitalRoundedIcon />, path: '/medical-claim', color: '#cc2037' }, // Dark Indigo
  { text: 'Reset Password', icon: <LockResetRoundedIcon />, path: '/reset-password', color: '#78002e' }, // Dark Crimson
];

const thirdListItems = [
  { text: 'Calendar', icon: <CalendarMonthRoundedIcon />, path: '/calendar', color: '#2053cc' }, // Dark Slate
  { text: 'Monthly Roaster', icon: <TableChartRoundedIcon />, path: '/roster', color: '#a8256fs' }, // Dark Brown
];

export default function MenuContent() {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={Link} to={item.path} selected={index === 0}>
              <ListItemIcon>
                {React.cloneElement(item.icon, { style: { color: item.color } })}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={Link} to={item.path}>
              <ListItemIcon>
                {React.cloneElement(item.icon, { style: { color: item.color } })}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        {thirdListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={Link} to={item.path}>
              <ListItemIcon>
                {React.cloneElement(item.icon, { style: { color: item.color } })}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}