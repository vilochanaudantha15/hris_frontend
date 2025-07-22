import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SelectContent from './SelectContent';
import MenuContent from './MenuContent';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

const ScrollContainer = styled(Box)({
  overflow: 'auto',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const formatNameWithInitials = (fullName) => {
  if (!fullName) return 'Guest User';
  const parts = fullName.split(' ');
  if (parts.length === 1) return fullName;
  const initials = parts.slice(0, -1).map(p => p[0].toUpperCase() + '.').join(' ');
  return `${initials} ${parts[parts.length - 1]}`;
};

export default function SideMenu() {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/userprofile');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/settings');
  };

  React.useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        setUser(null);
        navigate('/', { replace: true });
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/employ/user`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!res.ok) {
          throw new Error('User fetch failed');
        }

        const data = await res.json();
        setUser(data.user);
        setError('');
      } catch (err) {
        console.error('Fetch error:', err.message);
        setUser(null);
        setError(err.message);

        if (err.message === 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading || (!user && !error)) return null;

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ display: 'flex', mt: 'calc(var(--template-frame-height, 0px) + 4px)', p: 1.5 }}>
        <SelectContent />
      </Box>

      <Divider />

      <ScrollContainer>
        <MenuContent />
      </ScrollContainer>

      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          alt={user?.name || 'User'}
          src={user?.avatar || '/static/images/avatar/7.jpg'}
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto' }}>
          <Typography variant="body2" fontWeight={500} lineHeight="16px">
            {formatNameWithInitials(user?.name)}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="9px">
            {user?.email || 'No email'}
          </Typography>
          {error && (
            <Typography variant="caption" color="error.main">
              {error}
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem onClick={handleProfile}>Profile</MenuItem>
          <MenuItem onClick={handleSettings}>Settings</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Stack>
    </Drawer>
  );
}