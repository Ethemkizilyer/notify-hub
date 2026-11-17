import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 3,
        py: { xs: 5, sm: 7 },
        borderRadius: 5,
        textAlign: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5} sx={{ alignItems: 'center', maxWidth: 420, mx: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            width: 64,
            height: 64,
            placeItems: 'center',
            borderRadius: '22px',
            color: 'primary.main',
            bgcolor: 'action.hover',
            '& svg': { fontSize: 30 },
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
        {actionLabel && onAction && (
          <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
