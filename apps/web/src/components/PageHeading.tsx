import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeading({ eyebrow, title, description, action }: PageHeadingProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', mb: 3.5 }}
    >
      <Box>
        <Typography variant="overline" color="primary.main">
          {eyebrow}
        </Typography>
        <Typography variant="h3" component="h1" sx={{ mt: 0.25 }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 620 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}
