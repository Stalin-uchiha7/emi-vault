// ============================================================================
// Sidebar — primary navigation. Collapses to a bottom nav / drawer on mobile
// (handled by the parent Layout component).
// ============================================================================
import { Box, Stack, Typography, alpha } from '@mui/material';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Landmark,
  CalendarDays,
  FileBarChart,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'EMIs', path: '/emis', icon: Landmark },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Reports', path: '/reports', icon: FileBarChart },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const adminOnlyItems = [{ label: 'Family Members', path: '/users', icon: Users }];

export default function Sidebar() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const items = isAdmin ? [...navItems.slice(0, 4), ...adminOnlyItems, navItems[4]] : navItems;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        py: 3,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.2} sx={{ px: 1, mb: 4 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #635BFF, #4F46E5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <Wallet size={19} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          EMI Vault
        </Typography>
      </Stack>

      <Stack spacing={0.5} sx={{ flex: 1 }}>
        {items.map((item) => (
          <Box
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.6,
              py: 1.2,
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
              '&.active': {
                bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === 'light' ? 0.1 : 0.18),
                color: 'primary.main',
              },
            }}
          >
            <item.icon size={19} strokeWidth={2.1} />
            {item.label}
          </Box>
        ))}
      </Stack>

      <Box sx={{ px: 1.6, py: 1.5, borderRadius: '14px', bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {isSuperAdmin ? 'Super Admin access' : isAdmin ? 'Admin access' : 'Member access'}
        </Typography>
      </Box>
    </Box>
  );
}
