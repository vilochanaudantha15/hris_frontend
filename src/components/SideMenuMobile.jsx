import * as React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import MenuButton from './MenuButton';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';

const formatNameWithInitials = (fullName) => {
  if (!fullName) return 'Guest User';
  const parts = fullName.split(' ');
  if (parts.length === 1) return fullName;
  const initials = parts.slice(0, -1).map(p => p[0].toUpperCase() + '.').join(' ');
  return `${initials} ${parts[parts.length - 1]}`;
};

function SideMenuMobile({ open, toggleDrawer }) {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
    toggleDrawer(false)();
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
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={user?.name || 'User'}
              src={user?.avatar || '/static/images/avatar/7.jpg'}
              sx={{ width: 24, height: 24 }}
            />
            <Stack>
              <Typography component="p" variant="h6">
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
            </Stack>
          </Stack>
          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <CardAlert />
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
};

export default SideMenuMobile;