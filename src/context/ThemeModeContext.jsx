// ============================================================================
// ThemeModeContext — dark/light toggle + selected currency, persisted to
// localStorage so preferences survive reloads.
// ============================================================================
import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '../theme/theme';
import { CURRENCIES } from '../constants';

const ThemeModeContext = createContext(null);

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('emi_theme_mode') || 'light');
  const [currency, setCurrency] = useState(() => localStorage.getItem('emi_currency') || 'INR');

  useEffect(() => {
    localStorage.setItem('emi_theme_mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('emi_currency', currency);
  }, [currency]);

  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);
  const currencySymbol = CURRENCIES[currency]?.symbol || '₹';

  const value = { mode, toggleMode, currency, setCurrency, currencySymbol };

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within AppThemeProvider');
  return ctx;
}
