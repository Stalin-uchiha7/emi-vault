// ============================================================================
// Premium fintech theme — inspired by CRED / Kite / Stripe / Notion.
// Rounded corners, soft shadows, restrained color palette, crisp type scale.
// ============================================================================
import { createTheme, alpha } from '@mui/material/styles';

const brand = {
  primary: '#635BFF', // Stripe-esque indigo-violet
  primaryDark: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

const shape = { borderRadius: 16 };

const typography = {
  fontFamily: [
    '"Inter"',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: { fontWeight: 700, letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, letterSpacing: '-0.02em' },
  h3: { fontWeight: 700, letterSpacing: '-0.01em' },
  h4: { fontWeight: 700, letterSpacing: '-0.01em' },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  subtitle1: { fontWeight: 500 },
  subtitle2: { fontWeight: 500 },
  button: { fontWeight: 600, textTransform: 'none' },
  body1: { fontSize: '0.95rem' },
  body2: { fontSize: '0.85rem' },
};

function buildTheme(mode) {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: { main: brand.primary, dark: brand.primaryDark, contrastText: '#fff' },
      success: { main: brand.success },
      warning: { main: brand.warning },
      error: { main: brand.danger },
      info: { main: brand.info },
      background: {
        default: isLight ? '#F7F7FB' : '#0B0B10',
        paper: isLight ? '#FFFFFF' : '#15151C',
      },
      text: {
        primary: isLight ? '#161622' : '#F1F1F5',
        secondary: isLight ? '#6B7280' : '#9498A8',
      },
      divider: isLight ? alpha('#111', 0.08) : alpha('#fff', 0.08),
    },
    shape,
    typography,
    shadows: [
      'none',
      '0px 1px 2px rgba(16,24,40,0.05)',
      '0px 2px 6px rgba(16,24,40,0.06)',
      '0px 4px 10px rgba(16,24,40,0.07)',
      '0px 6px 16px rgba(16,24,40,0.08)',
      ...Array(20).fill('0px 10px 30px rgba(16,24,40,0.10)'),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: `${isLight ? '#ccc' : '#333'} transparent`,
            '&::-webkit-scrollbar': { width: 8, height: 8 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
              borderRadius: 8,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 18,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: `1px solid ${isLight ? alpha('#111', 0.06) : alpha('#fff', 0.06)}`,
            boxShadow: isLight
              ? '0px 4px 20px rgba(16,24,40,0.05)'
              : '0px 4px 20px rgba(0,0,0,0.35)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            paddingTop: 9,
            paddingBottom: 9,
            boxShadow: 'none',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: '0px 4px 14px rgba(99,91,255,0.3)' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 600 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isLight ? alpha('#111', 0.06) : alpha('#fff', 0.06)}`,
          },
          head: {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: isLight ? '#6B7280' : '#9498A8',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20 },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
    },
  });
}

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');
export { brand };
