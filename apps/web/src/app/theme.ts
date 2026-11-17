import { createTheme } from '@mui/material/styles';

export function createAppTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#4f46e5' },
    },
    shape: { borderRadius: 10 },
  });
}
