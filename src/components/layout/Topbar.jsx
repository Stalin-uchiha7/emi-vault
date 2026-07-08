// ============================================================================
// Topbar — page title, notification bell with dropdown, theme toggle, and
// user profile menu with logout.
// ============================================================================
import { useState } from 'react';
import {
  Box,
  Stack,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Divider,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import { Bell, Sun, Moon, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeModeContext';
import { logoutUser } from '../../firebase/authService';
import { useNotifications } from '../../hooks/useNotifications';
import dayjs from 'dayjs';

export default function Topbar({ title, onMenuClick }) {
  const { profile, user } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const initials = (profile?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: { xs: 2, md: 3 }, py: 2 }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <IconButton onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
          <MenuIcon size={20} />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          <IconButton onClick={toggleMode} sx={{ bgcolor: 'action.hover' }}>
            {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ bgcolor: 'action.hover' }}>
            <Badge badgeContent={notifications.length} color="error">
              <Bell size={18} />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu anchorEl={notifAnchor} open={!!notifAnchor} onClose={() => setNotifAnchor(null)} PaperProps={{ sx: { width: 320, maxHeight: 400, mt: 1 } }}>
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 700 }}>
            Notifications
          </Typography>
          <Divider />
          {notifications.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3, textAlign: 'center' }}>
              You're all caught up 🎉
            </Typography>
          )}
          {notifications.map((n, i) => (
            <MenuItem key={i} sx={{ whiteSpace: 'normal', py: 1.2 }} onClick={() => { setNotifAnchor(null); navigate(`/emis/${n.loanId}`); }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{n.title}</Typography>
                <Typography variant="caption" color="text.secondary">{n.subtitle}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        <Tooltip title={profile?.name || user?.email}>
          <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu anchorEl={profileAnchor} open={!!profileAnchor} onClose={() => setProfileAnchor(null)} PaperProps={{ sx: { width: 220, mt: 1 } }}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{profile?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setProfileAnchor(null); navigate('/settings'); }}>Profile Settings</MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogOut size={17} color="currentColor" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Stack>
    </Stack>
  );
}
