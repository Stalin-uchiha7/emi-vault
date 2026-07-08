// ============================================================================
// App — top-level route definitions.
// ============================================================================
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthProvider } from './context/AuthContext';
import { AppThemeProvider } from './context/ThemeModeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EMIsPage from './pages/EMIsPage';
import LoanDetails from './pages/LoanDetails';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <AppThemeProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={3500}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/emis" element={<EMIsPage />} />
                  <Route path="/emis/:loanId" element={<LoanDetails />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute adminOnly>
                        <UsersPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </LocalizationProvider>
      </SnackbarProvider>
    </AppThemeProvider>
  );
}
