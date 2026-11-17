import { Box, Paper, Stack, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import type { ReactNode } from 'react';

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
        minHeight: { md: 590 },
        borderRadius: { xs: 5, md: 7 },
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        boxShadow: '0 24px 70px rgba(33, 49, 39, 0.07)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          isolation: 'isolate',
          overflow: 'hidden',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 590,
          p: { md: 5, lg: 7 },
          color: '#fffdf8',
          background:
            'radial-gradient(circle at 82% 22%, rgba(204, 169, 126, 0.3), transparent 24%), linear-gradient(150deg, #1d4737, #285b46 70%, #39694f)',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            zIndex: 0,
            width: 430,
            height: 430,
            right: -140,
            bottom: -160,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.23)',
            boxShadow: '0 0 0 34px rgba(255,255,255,0.035), 0 0 0 72px rgba(255,255,255,0.025)',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 5 }}>
            <AutoAwesomeRoundedIcon sx={{ color: '#e9c8a9', fontSize: 20 }} />
            <Typography variant="overline" sx={{ color: '#e9c8a9' }}>
              {eyebrow}
            </Typography>
          </Stack>
          <Typography variant="h2" sx={{ maxWidth: 440, fontSize: '3.6rem', lineHeight: 1.03 }}>
            {title}
          </Typography>
          <Typography
            sx={{ mt: 2, maxWidth: 390, color: 'rgba(255,253,248,0.75)', lineHeight: 1.8 }}
          >
            {description}
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ position: 'relative', zIndex: 1, alignItems: 'center' }}
        >
          <Box sx={{ display: 'flex' }}>
            {['#d9a783', '#b7c9a8', '#f0dfc7'].map((color, index) => (
              <Box
                key={color}
                sx={{
                  width: 30,
                  height: 30,
                  ml: index === 0 ? 0 : -0.8,
                  borderRadius: '50%',
                  border: '2px solid #285b46',
                  bgcolor: color,
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,253,248,0.75)' }}>
            Siparişin her adımında yanındayız
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2.5, sm: 5, lg: 7 },
        }}
      >
        <Paper elevation={0} sx={{ width: '100%', maxWidth: 400, bgcolor: 'transparent' }}>
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
            <Typography variant="overline" color="primary.main">
              {eyebrow}
            </Typography>
            <Typography variant="h3" component="h1" sx={{ mt: 0.5 }}>
              {title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {description}
            </Typography>
          </Box>
          {children}
          {footer}
        </Paper>
      </Box>
    </Box>
  );
}
