import { createTheme } from '@mui/material/styles';

export function createAppTheme(mode: 'light' | 'dark') {
  const light = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: { main: light ? '#245c48' : '#8ec8a9', contrastText: light ? '#fffdf8' : '#14241c' },
      secondary: { main: light ? '#c46f4d' : '#f0a27f' },
      background: {
        default: light ? '#f6f4ee' : '#121a17',
        paper: light ? '#fffefa' : '#1a2420',
      },
      text: {
        primary: light ? '#1d2a24' : '#eff4ef',
        secondary: light ? '#727b74' : '#aab8af',
      },
      divider: light ? '#e8e6dd' : '#2c3932',
      success: { main: light ? '#397b5a' : '#8ec8a9' },
      warning: { main: light ? '#b8792e' : '#e8b968' },
      error: { main: light ? '#b34d45' : '#e58b7d' },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: '"Manrope", "Segoe UI", sans-serif',
      h1: {
        fontFamily: '"DM Serif Display", Georgia, serif',
        fontWeight: 400,
        letterSpacing: '-0.035em',
      },
      h2: {
        fontFamily: '"DM Serif Display", Georgia, serif',
        fontWeight: 400,
        letterSpacing: '-0.03em',
      },
      h3: { fontWeight: 700, letterSpacing: '-0.035em' },
      h4: { fontWeight: 700, letterSpacing: '-0.03em' },
      h5: { fontWeight: 700, letterSpacing: '-0.025em' },
      h6: { fontWeight: 700, letterSpacing: '-0.02em' },
      button: { fontWeight: 700, textTransform: 'none' },
      overline: { fontWeight: 800, letterSpacing: '0.14em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: light
              ? 'radial-gradient(ellipse at 92% 0%, rgba(229, 221, 196, 0.22), transparent 30%)'
              : 'radial-gradient(ellipse at 92% 0%, rgba(65, 100, 79, 0.16), transparent 30%)',
            minHeight: '100vh',
          },
          '::selection': {
            backgroundColor: light ? '#dce9df' : '#3d5949',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 44,
            borderRadius: 12,
            paddingInline: 18,
            boxShadow: 'none',
            transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
            '&:hover': {
              boxShadow: light
                ? '0 8px 20px rgba(36, 92, 72, 0.14)'
                : '0 8px 20px rgba(0, 0, 0, 0.2)',
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            '&:hover': { boxShadow: '0 10px 24px rgba(36, 92, 72, 0.2)' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: light ? '#e8e6dd' : '#2c3932' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: light
              ? '0 8px 28px rgba(37, 47, 39, 0.035)'
              : '0 8px 28px rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: light ? '#fffefa' : '#1a2420',
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 9, fontWeight: 700 } },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            color: light ? '#737b74' : '#aab8af',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          },
        },
      },
    },
  });
}
