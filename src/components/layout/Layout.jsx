// ============================================================================
// Layout — persistent sidebar on desktop, slide-in drawer on mobile.
// Wraps routed pages with Topbar + AnimatePresence page transitions.
// ============================================================================
import { useState } from 'react';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PageTransition from '../common/PageTransition';

const pageTitles = {
  '/': 'Dashboard',
  '/emis': 'EMI Management',
  '/calendar': 'Calendar',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/users': 'Family Members',
};

function getTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/emis/')) return 'Loan Details';
  return 'EMI Vault';
}

export default function Layout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isDesktop ? (
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            height: '100vh',
          }}
        >
          <Sidebar />
        </Box>
      ) : (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          PaperProps={{ sx: { width: 260 } }}
        >
          <Sidebar />
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Topbar title={getTitle(location.pathname)} onMenuClick={() => setMobileOpen(true)} />
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 6 }}>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
